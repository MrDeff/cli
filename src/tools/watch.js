import slash from 'slash';
import Logger from '@bitrix/logger';
import path, {basename} from 'path';
import EventEmitter from 'events';
import chokidar from 'chokidar';
import Directory from '../entities/directory';
import repository from '../process/repository';
import isAllowed from '../utils/is-allowed';
import isInput from '../utils/is-input';

function isAllowedChanges(directories, file) {
	return directories
		.every(dir => isAllowed(file) && isInput(dir, file));
}

function createPattern(directories) {
	return directories.reduce((acc, dir) => {
		const directory = new Directory(dir);
		const directoryConfigs = directory.getConfigs();

		directoryConfigs.forEach((currentConfig) => {
			acc.push(slash(path.resolve(currentConfig.context, '**/*.js')));
			acc.push(slash(path.resolve(currentConfig.context, '**/*.css')));
			acc.push(slash(path.resolve(currentConfig.context, '**/*.scss')));
			acc.push(slash(path.resolve(currentConfig.context, '**/*.vue')));
		});

		return acc;
	}, []);
}

export default function watch(directories) {
	const preparedDirectories = Array.isArray(directories) ? directories : [directories];
	const pattern = createPattern(preparedDirectories);
	const emitter = new EventEmitter();

	const watcher = chokidar.watch(pattern)
		.on('ready', () => emitter.emit('ready', watcher))
		.on('change', (file) => {
			if (repository.isLocked(file)) {
				Logger.log('Build lock');
				return;
			}
			Logger.log(`Build module ->>> ${file}`);

			// if (!isAllowedChanges(preparedDirectories, file)) {
			// 	return;
			// }
			Logger.log('Build module 2');
			const changedConfig = preparedDirectories
				.reduce((acc, dir) => acc.concat((new Directory(dir)).getConfigs()), [])
				.filter(config => path.resolve(file).includes(config.context))
				.reduce((prevConfig, config) => {
					if (prevConfig && prevConfig.context.length > config.context.length) {
						return prevConfig;
					}
					return config;
				}, null);
			Logger.log('Build module 3');
			Logger.log(`Build module ${changedConfig}`);
			//
			// if (changedConfig) {
			emitter.emit('change', []);
			// }
		});

	process.nextTick(() => {
		emitter.emit('start', watcher);
	});

	return emitter;
}
