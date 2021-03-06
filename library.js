'use strict';

const {Groups, database: db} = require('./lib/nodebb');

module.exports.userChanges = async function (users) {
	const groupList = await Groups.getGroups('groups:visible:name', 0, 100).catch(console.error);
	for(let groupId=0; groupId < groupList.length; groupId++){
		for(let idx=0; idx < users.length;idx++) {
			if(!!users[idx].username) {
				const isOwnerBool = await Groups.ownership
					.isOwner(users[idx].uid, groupList[groupId].split(':')[0]).catch(console.error);
				if(isOwnerBool){
					users[idx].isOwner = users[idx].isOwner ?  users[idx].isOwner: {};
					users[idx].isOwner[groupList[groupId].split(':')[0]] = isOwnerBool;
				}
			};
		}
	}
	console.log(users);
	return users;
};

module.exports.groupUpdate = async function ({name, values}) {
	await db.setObject(`group-custom-fields:${name}`, {
		location: values.location,
		placeId: values.placeId,
		rules: values.rules,
		cid: values.cid,
		coverUrl: values.coverUrl,
		latitude: values.latitude,
		longitude: values.longitude,
		isNational: values.isNational,
	}).catch(console.error);
	delete values.location;
	delete values.placeId;
	delete values.rules;
	delete values.cid;
	delete values.coverUrl;
	delete values.latitude;
	delete values.longitude;
	delete values.isNational;
	return {values};
};

module.exports.groupGet = async function ({ groups = []}) {
	const customizedGroups = groups
		.filter(group => !!group) // NodeBB is returning null groups probably deleted leftovers
		.map(async group => {
			const res = await db.getObject(`group-custom-fields:${group.name}`).catch(console.error);
			return Object.assign(group, res);
		});
	return { groups: await Promise.all(customizedGroups) };
};

module.exports.groupCreate = async function ({group, data}) {
	await db.setObject(`group-custom-fields:${group.name}`, {location:'', placeId:'', rules:'', cid:'', coverUrl: '', latitude: 0, longitude: 0, isNational: false})
		.catch(console.error);
};

module.exports.categoryUpdate = async function ({ name, values }) {
  await db
    .setObject(`category-custom-fields:${name}`, {
			iconName: values.iconName,
			isAdminOnly: values.isAdminOnly,
    })
    .catch(console.error);
	delete values.iconName;
	delete values.isAdminOnly;

  return { values };
};

module.exports.categoryGet = async function ({ category }) {
  if (category) {
		const res = await db
			.getObject(`category-custom-fields:${category.name}`)
			.catch(console.error);
		Object.assign(category, res);
  }
  return { category };
};

module.exports.categoryCreate = async function ({ category, data }) {
  await db
    .setObject(`group-custom-fields:${category.name}`, {
			iconName: '',
			isAdminOnly: false,
    })
		.catch(console.error);

	return { category, data };
};


