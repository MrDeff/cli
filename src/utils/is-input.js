import path from 'path';
import Logger from '@bitrix/logger';
import Directory from '../entities/directory';

export default function isInput(dir, fileName) {
	return (new Directory(dir)).getConfigs().every((config) => {
			Logger.log(`Build config ${config}`);
			Logger.log(`Build dir ${dir}`);
			Logger.log(`Build fileName ${fileName}`);
			return true;
		// return !fileName.includes(path.normalize(config.output.js))
		// 	&& !fileName.includes(path.normalize(config.output.css));
	});
};