import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import {getApplicationsManagerServiceInstance} from "../services/ApplicationsManagerService.js";

const rootModel = {
    pageLoader: {
        walletContent: `/pages/accept-applications-content.html`
    },
    content: [],
    applications: [],
    pageTitle: "E-wallet",
    conditionalExpressions: {
        isLoading: false,
        isGridLayout: false,
    },
    hoverLabels: {
        switchGridHover: "Click to switch to list",
        switchListHover: "Click to switch to grid",
    },

    searchBox: {
        name: 'searchBar',
        required: false,
        placeholder: 'Search for an app',
        value: ''
    },
    contentLabels: {
        noItemsLabel: "There are no applications.",
        myWalletLabel: "Manage Applications"
    }
};

export default class AcceptApplicationsController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        this.ApplicationsManagerService = getApplicationsManagerServiceInstance();
        this.model = this.setModel(this._getCleanProxyObject(rootModel));

        this._populateApplicationList();
        this._initListeners();
    }

    _populateApplicationList = () => {
        this.ApplicationsManagerService.listInReviewApplications((err, applications) => {
            if (err) {
                console.log(err);
                return;
            }
            this.setModelKey('content', applications)
            this.setModelKey('applications', applications)
        });
    }

    _initListeners = () => {
        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });

        this.on("switch-layout", this._handleSwitchLayout);

        this.on("marketplace-application-accept-on-click", this._handleAppAccept);
        this.on("marketplace-application-deny-on-click", this._handleAppDeny);

        this.on('marketplace-applications', (event) => {
            this.History.navigateToPageByTag('marketplace');
        });

        this.model.onChange('currentPath', () => {
            this._initNavigationLinks();
        });

        this.model.onChange('searchBox', () => {
            this._handleSearchChange();
        });
    };

    _handleAppAccept = (event) => {
        let actionModalModel = {
            title: "Are you sure?",
            description: "Accepting an application will make it visible to the public and it's a non-reversible process.",
            acceptButtonText: 'Yes, accept it!',
            denyButtonText: 'No, go back.',
        }
        this.showModal('confirmActionModal', actionModalModel, (err, response) => {
            if (err || response.value === false) {
                return;
            }
            let newAppDetails = {
                ...event.data,
                visible: true
            }
            this.ApplicationsManagerService.editApplication(newAppDetails, (err, data) => {
                if (err) {
                    console.log(err);
                }
                this._emitFeedback(event, "Application " + newAppDetails.name + " accepted into the store successfully.", "alert-success")
                this._populateApplicationList();
            });
        });
    }

    _handleAppDeny = (event) => {
        let actionModalModel = {
            title: "Are you sure?",
            description: "Denying an application will delete the application from management menu and it's a non-reversible process.",
            acceptButtonText: 'Yes, deny it!',
            denyButtonText: 'No, go back.',
        }
        this.showModal('confirmActionModal', actionModalModel, (err, response) => {
            if (err || response.value === false) {
                return;
            }
            this.ApplicationsManagerService.removeApplication(event.data, (err, data) => {
                if (err) {
                    console.log(err);
                }
                this._emitFeedback(event, "Application " + event.data.name + " denied successfully.", "alert-success")
                this._populateApplicationList();
            });
        });
    }

    _handleSwitchLayout = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        this.model.isGridLayout = !this.model.isGridLayout;
    };

    _handleSearchChange = () => {
        let searchTerm = this.model.searchBox.value.toLowerCase();
        let matchedApps = this.model.applications.filter(app => this.__lowTextContainsLowTerm(app.name, searchTerm) || this.__lowTextContainsLowTerm(app.description, searchTerm))
        this.model.setChainValue('content', matchedApps);
    };

    __lowTextContainsLowTerm(lowText, lowTerm) {
        return lowText.toLowerCase().includes(lowTerm.toLowerCase());
    }

    _getCleanProxyObject = (obj) => {
        return obj ? JSON.parse(JSON.stringify(obj)) : null;
    }

    setModelKey(key, value) {
        this.model.setChainValue(key, JSON.parse(JSON.stringify(value)));
    }

    _emitFeedback(event, message, alertType) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (typeof this.feedbackEmitter === 'function') {
            this.feedbackEmitter(message, "Validation", alertType)
        }
    }
}