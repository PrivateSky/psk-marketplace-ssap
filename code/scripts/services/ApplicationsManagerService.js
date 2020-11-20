class ApplicationsManagerService {

    constructor() {
        const HostBootScript = require("boot-host").HostBootScript;
        new HostBootScript("category-manager-service");
    }

    addApplication(callback) {
        $$.interaction.startSwarmAs("test/agent/007", "applicationsSwarm", "createApplication").onReturn(callback);
    }

    editApplication(applicationDetails, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "applicationsSwarm", "editApplication", applicationDetails).onReturn(callback);
    }

    installApplication(applicationDetails, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "applicationsSwarm", "installApplication", applicationDetails).onReturn(callback);
    }

    removeApplication(applicationPath, callback) {
        $$.interaction.startSwarmAs("test/agent/007", "applicationsSwarm", "removeApplication", applicationPath).onReturn(callback);
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
};

export {
    getApplicationsManagerServiceInstance
};