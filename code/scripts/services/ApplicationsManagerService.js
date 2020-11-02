import DSUStorage from "../../cardinal/controllers/base-controllers/lib/DSUStorage.js";

class ApplicationsManagerService {

    constructor() {
        const HostBootScript = require("boot-host").HostBootScript;
        new HostBootScript("category-manager-service");
        this.DSUStorage = new DSUStorage();
    }

    addMarketplace(marketplaceData, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "applicationsSwarm", "createMarketplaceDossier", marketplaceData).onReturn(callback);
    }

    addApplication(callback) {
        $$.interaction.startSwarmAs("test/agent/007", "applicationsSwarm", "createApplicationsDossier").onReturn(callback);
    }

    editApplication(applicationDetails, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "applicationsSwarm", "editApplicationsDossier", applicationDetails).onReturn(callback);
    }

    installApplication(applicationDetails, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "applicationsSwarm", "installApplicationsDossier", applicationDetails).onReturn(callback);
    }

    removeApplication(applicationPath, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "applicationsSwarm", "removeApplicationDossier", applicationPath).onReturn(callback);
    }

    listApplications(callback) {
        $$.interaction.startSwarmAs("test/agent/007", "applicationsSwarm", "listApplications").onReturn(callback);
    }

    listInReviewApplications(callback) {
        $$.interaction.startSwarmAs("test/agent/007", "applicationsSwarm", "listInReviewApplications").onReturn(callback);
    }

    getMarketplaceKeySSI(callback) {
        $$.interaction.startSwarmAs("test/agent/007", "applicationsSwarm", "getMarketplaceKeySSI").onReturn(callback);
    }
}

let applicationsManagerService = new ApplicationsManagerService();
let getApplicationsManagerServiceInstance = function () {
    return applicationsManagerService;
}

export {
    getApplicationsManagerServiceInstance
};