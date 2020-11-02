domainRequire=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"./../../domain":[function(require,module,exports){
console.log("Loaded from domain.js");

const MARKETPLACE_APP_SEED = `/web-wallet/apps/psk-marketplace-ssapp/seed`;
const CODE_FOLDER = "/code";
const INSTALLED_APPLICATIONS_MOUNTING_PATH = "/my-apps";
const IN_REVIEW_APPLICATIONS_MOUNTING_PATH = "/appsInReview";
const AVAILABLE_APPLICATIONS_MOUNTING_PATH = "/availableApps";

const MARKETPLACES_MOUNTING_PATH = "/marketplaces";

const keyssiresolver = require("opendsu").loadApi("resolver");

$$.swarms.describe('applicationsSwarm', {
    start: function (data) {
        if (rawDossier) {
            return this.createApplicationsDossier(data);
        }
        this.return(new Error("Raw Dossier is not available."));
    },

    __createApplicationsDossier: function (callback) {
        const keyssiSpace = require("opendsu").loadApi("keyssi");
        rawDossier.getKeySSI((err, ssi) => {
            if (err) {
                return this.return(err);
            }
            const templateSSI = keyssiSpace.buildSeedSSI(keyssiSpace.parse(ssi).getDLDomain());
            keyssiresolver.createDSU(templateSSI, (err, newDossier) => {
                if (err) {
                    console.error(err);
                    this.return(err);
                }
                newDossier.getKeySSI((err, keySSI) => {
                    if (err) {
                        return callback(err);
                    }
                    console.log('Mounted app: ', keySSI)
                    callback(undefined, keySSI);
                });
            });
        });
    },

    createApplicationsDossier: function () {
        this.__createApplicationsDossier((err, keySSI) => {
            if (err) {
                console.error(err);
                return this.return(err);
            }
            this.mountDossier(rawDossier, IN_REVIEW_APPLICATIONS_MOUNTING_PATH, keySSI)
        })
    },

    editApplicationsDossier: function (applicationDetails) {
        this.__removeApplicationDossier(applicationDetails, (err, data) => {
            if (err) {
                return this.return(err);
            }
            applicationDetails = {
                ...applicationDetails,
                image: applicationDetails.image.replace('/appsInReview/', '/availableApps/')
            }
            this.__editApplication(applicationDetails, (err, data) => {
                if (err) {
                    return this.return(err);
                }
                this.mountDossier(rawDossier, AVAILABLE_APPLICATIONS_MOUNTING_PATH, applicationDetails.identifier);
            })
        });
    },

    __editApplication: function (applicationsDetails, callback) {
        resolver.loadDSU(applicationsDetails.identifier, (err, applicationDossier) => {
            if (err) {
                return callback(err);
            }
            applicationDossier.writeFile('/data', JSON.stringify(applicationsDetails), callback);
        });
    },

    installApplicationsDossier: function (applicationDetails) {
        this.__removeApplicationDossier(applicationDetails, (err, data) => {
            if (err) {
                return this.return(err);
            }

            applicationDetails = {
                ...applicationDetails,
                image: applicationDetails.image.replace('/availableApps/', '/my-apps/')
            }
            this.__editApplication(applicationDetails, (err, data) => {
                if (err) {
                    return this.return(err);
                }
                this.mountDossier(rawDossier, INSTALLED_APPLICATIONS_MOUNTING_PATH, applicationDetails.identifier);
            })
        });
    },

    __removeApplicationDossier(applicationDetails, callback) {
        rawDossier.unmount(applicationDetails.path, (err, data) => {
            if (err) {
                return callback(err);
            }
            return callback(err, data);
        });
    },

    removeApplicationDossier(applicationDetails) {
        this.__removeApplicationDossier(applicationDetails, (err, data) => {
            if (err) {
                return this.return(err);
            }
            return this.return(err, data);
        });
    },

    listApplications: function () {
        this.__listApplications(INSTALLED_APPLICATIONS_MOUNTING_PATH, (err, installedApps) => {
            if (err) {
                return this.return(err);
            }
            this.__listApplications(AVAILABLE_APPLICATIONS_MOUNTING_PATH, (err, availableApps) => {
                if (err) {
                    return this.return(err);
                }
                this.return(err, {
                    installed: installedApps,
                    available: availableApps
                });
            });
        });
    },

    listInReviewApplications: function () {
        this.__listApplications(IN_REVIEW_APPLICATIONS_MOUNTING_PATH, (err, data) => {
            if (err) {
                return this.return(err);
            }
            this.return(err, data);
        });
    },

    __listApplications: function (PATH, callback) {
        rawDossier.readDir(PATH, (err, applications) => {
            if (err) {
                return callback(err);
            }
            let toBeReturned = [];

            let getApplicationData = (application) => {
                let appPath = PATH + '/' + application.path;
                rawDossier.readFile(appPath + '/data', (err, fileContent) => {
                    toBeReturned.push({
                        ...JSON.parse(fileContent),
                        path: appPath,
                        identifier: application.identifier
                    });
                    if (applications.length > 0) {
                        getApplicationData(applications.shift())
                    } else {
                        return callback(undefined, toBeReturned);
                    }
                });
            };
            if (applications.length > 0) {
                return getApplicationData(applications.shift());
            }
            return callback(undefined, toBeReturned);
        })
    },

    getMarketplaceKeySSI: function () {
        rawDossier.getKeySSI((err, keySSI) => {
            if (err) {
                this.return(err);
            }
            this.return(undefined, keySSI);
        });
    },

    mountDossier: function (parentDossier, mountingPath, seed) {
        const PskCrypto = require("pskcrypto");
        const hexDigest = PskCrypto.pskHash(seed, "hex");
        let path = `${mountingPath}/${hexDigest}`;
        parentDossier.mount(path, seed, (err) => {
            if (err) {
                console.error(err);
                return this.return(err);
            }
            this.return(undefined, {path: path, seed: seed});
        });
    }
});
},{"opendsu":false,"pskcrypto":false}],"C:\\Users\\CosminIulianIrimia\\Documents\\Work\\psk-enterprise-workspace\\psk-marketplace-ssapp\\builds\\tmp\\domain_intermediar.js":[function(require,module,exports){
(function (global){
global.domainLoadModules = function(){ 

	if(typeof $$.__runtimeModules["./../../domain"] === "undefined"){
		$$.__runtimeModules["./../../domain"] = require("./../../domain");
	}
};
if (true) {
	domainLoadModules();
}
global.domainRequire = require;
if (typeof $$ !== "undefined") {
	$$.requireBundle("domain");
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../domain":"./../../domain"}]},{},["C:\\Users\\CosminIulianIrimia\\Documents\\Work\\psk-enterprise-workspace\\psk-marketplace-ssapp\\builds\\tmp\\domain_intermediar.js"])