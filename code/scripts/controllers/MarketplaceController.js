import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import {getApplicationsManagerServiceInstance} from "../services/ApplicationsManagerService.js";

const rootModel = {
    pageLoader: {
        walletContent: `/pages/marketplace-content.html`
    },
    content: [],
    applications: [],
    pageTitle: "E-wallet",
    conditionalExpressions: {
        isLoading: false,
        isGridLayout: false,
        isAdmin: true
    },
    isAdmin: true,
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
        myWalletLabel: "Marketplace"
    },
    mountedCategoryPath: 'abc'
};

export default class MarketplaceController extends ContainerController {
    constructor(element, history) {
        super(element, history);

        this.ApplicationsManagerService = getApplicationsManagerServiceInstance();
        this.model = this.setModel(this._getCleanProxyObject(rootModel));
        this._populateApplicationList();
        //this._initNavigationLinks();
        this._initListeners();
    }

    _populateApplicationList = () => {
        this.ApplicationsManagerService.listApplications((err, applications) => {
            if (err) {
                console.log(err);
                return;
            }
            let mappedInstalledApplications = applications.installed.map((app) => {
                return {
                    ...app,
                    installed: true
                }
            });
            let mappedAvailableApplications = applications.available.map((app) => {
                return {
                    ...app,
                    installed: false
                }
            });
            let apps = [...mappedInstalledApplications, ...mappedAvailableApplications]
            this.setModelKey('content', apps)
            this.setModelKey('applications', apps)
        });
    }

    _initListeners = () => {
        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });

        this.on("switch-layout", this._handleSwitchLayout);
        this.on("marketplace-application-manager-on-install-click", this._handleInstallAppManager);
        this.on("marketplace-application-manager-on-open-click", this._handleOpenAppManager);

        this.on('submit-application', (event) => {
            this.History.navigateToPageByTag('submit-application');
        });
        this.on('submit-marketplace', (event) => {
            this.History.navigateToPageByTag('submit-marketplace');
        });

        this.on('manage-applications', (event) => {
            this.History.navigateToPageByTag('accept-applications');
        });

        this.model.onChange('searchBox', () => {
            this._handleSearchChange();
        });

        this.on('share-marketplace', (event) => {

            this.ApplicationsManagerService.getMarketplaceKeySSI((err, keySSI) => {
                if (err) {
                    return console.log(err);
                }
                let qrCodeModalModel = {
                    title: `Share your marketplace`,
                    description: `Sharing this marketplace means someone else will have access to it. Think twice about it.`,
                    data: {
                        identifier: keySSI
                    }
                }
                this._shareQRCodeModalHandler(event, qrCodeModalModel);
            });
        });
    };

    _shareQRCodeModalHandler(event, model) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.showModal('shareQRCodeModal', model);
    }

    _handleInstallAppManager = (event) => {
        let newAppDetails = {
            ...event.data,
            installed: true
        }
        this.ApplicationsManagerService.installApplication(newAppDetails, (err, data) => {
            if (err) {
                console.log(err);
            }
            this._emitFeedback(event, "Application " + newAppDetails.name + " installed successfully.", "alert-success")
            this._populateApplicationList();
        });
    }

    _handleOpenAppManager = (event) => {
        console.log("Pressed open", event.data);
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

    _initNavigationLinks = () => {
        let wDir = this.model.currentPath || '/';
        let links = [{
            label: this.model.contentLabels.myWalletLabel,
            path: '/',
            disabled: false
        }];

        // If the current path is root
        if (wDir === '/') {
            links[0].disabled = true;
            this.model.setChainValue('navigationLinks', links);
            return;
        }

        // If anything, but root
        let paths = wDir.split('/');
        // pop out first element as it is the root and create below the My Wallet(Home / Root) Link
        paths.shift();

        paths.forEach((pathSegment) => {
            let path = links[links.length - 1].path;
            if (path === '/') {
                path = `/${pathSegment}`;
            } else {
                path = `${path}/${pathSegment}`;
            }

            links.push({
                label: pathSegment,
                path: path,
                disabled: false
            });
        });

        // Disable the last link as it is the current directory in navigation
        links[links.length - 1].disabled = true;

        // Set the navigation links to view-model
        this.model.setChainValue('navigationLinks', links);
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