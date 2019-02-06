import {type} from 'main.core';

export class {{name}}
{
	constructor(options = {name: '{{name}}'})
	{
		this.name = options.name;
	}

	setName(name)
	{
		if (type.isString(name))
		{
			this.name = name;
		}
	}

	getName()
	{
		return this.name;
	}
}