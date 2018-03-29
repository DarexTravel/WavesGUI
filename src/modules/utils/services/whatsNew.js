(function () {
    'use strict';

    /**
     *
     * @param {NotificationManager} notificationManager
     * @param {User} user
     * @param {Migration} migration
     * @param {app.utils} utils
     */
    const factory = function (notificationManager, user, migration, utils) {

        const MIGRATION_LIST = [
            '1.0.0-beta.21'
        ];

        /**
         * @param {string|Array<string>} version
         */
        function addVersions(version) {
            const versions = user.getSetting('whatsNewList').slice();
            utils.toArray(version).forEach((version) => {
                versions.push(version);
            });
            user.setSetting('whatsNewList', versions);
        }

        function removeVersion(version) {
            const versions = user.getSetting('whatsNewList').slice();
            const index = versions.indexOf(version);
            if (index !== -1) {
                versions.splice(index, 1);
                user.setSetting('whatsNewList', versions);
            }
        }

        function unique(list1, list2) {
            const hash = Object.create(null);
            list1.concat(list2).forEach((version) => {
                hash[version] = true;
            });
            return Object.keys(hash);
        }

        user.onLogin().then(() => {
            const notShownUpdates = user.getSetting('whatsNewList');
            const lastOpenVersion = user.getSetting('lastOpenVersion');
            const newVersionList = migration.migrateFrom(lastOpenVersion || WavesApp.version, MIGRATION_LIST);

            migration.sort(unique(newVersionList, notShownUpdates)).forEach((version) => {
                notificationManager.info({
                    ns: 'app.utils',
                    title: {
                        literal: 'utils.whatsNew.title',
                        params: { version }
                    },
                    body: {
                        literal: `utils.whatsNew.body.${version.replace(/\./g, '_')}`
                    },
                    onClose() {
                        removeVersion(version);
                    }
                }, -1);
            });

            addVersions(newVersionList);
            user.setSetting('lastOpenVersion', WavesApp.version);
        });

        return Object.create(null);
    };

    factory.$inject = ['notificationManager', 'user', 'migration', 'utils'];

    angular.module('app.utils').factory('whatsNew', factory);
})();