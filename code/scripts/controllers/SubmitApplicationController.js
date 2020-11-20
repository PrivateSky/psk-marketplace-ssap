import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import {getApplicationsManagerServiceInstance} from "../services/ApplicationsManagerService.js";

const rootModel = {
    pageTitle: "E-wallet",
    labels: {

    },
    name: {
        label: "Name",
        name: 'name',
        required: true,
        placeholder: 'Application name ...',
        value: ''
    },
    description: {
        label: "Description",
        name: 'description',
        required: true,
        placeholder: 'Application description ...',
        value: ''
    },
    keySSI: {
        label: "Key SSI",
        name: 'keySSI',
        required: true,
        placeholder: 'Application Key SSI ...',
        value: ''
    },
    image: null,
    fileChooserLabel: 'Select image...',
    contentLabels: {
        myWalletLabel: "Submit Application"
    },
    filesArray: []
};

export default class SubmitApplicationController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        this.ApplicationsManagerService = getApplicationsManagerServiceInstance();
        this.model = this.setModel(this._getCleanProxyObject(rootModel));
        this.image = null;

        this._initNavigationLinks();
        this._initListeners();
    }

    _initListeners = () => {
        this.on('openFeedback', (evt) => {
            this.feedbackEmitter = evt.detail;
        });

       this.on('application-submit', this._handleApplicationSubmit);
       this.on('import-app-image', this._handleImageSelect);
    };

    _handleImageSelect = (event) => {
        this.image = event.data;
    }

    __displayErrorIfFieldIsNullOrEmpty(event, fieldName, field) {
        if (field === undefined || field === null || field.length === 0) {
            this._emitFeedback(event, fieldName + " field is required.", "alert-danger")
            return true;
        }
        return false;
    }

    __displayErrorMessages = (event) => {
        return this.__displayErrorIfFieldIsNullOrEmpty(event, 'Name', this.model.name.value) ||
            this.__displayErrorIfFieldIsNullOrEmpty(event, 'Description', this.model.description.value) ||
            this.__displayErrorIfFieldIsNullOrEmpty(event, 'KeySSI', this.model.keySSI.value) ||
            this.__displayErrorIfFieldIsNullOrEmpty(event, 'Image', this.image);

    }

    _handleApplicationSubmit = (event) => {
        if (this.__displayErrorMessages(event)) {
            return;
        }
        let appDetails = {
            name: this.model.name.value,
            description: this.model.description.value,
            keySSI: this.model.keySSI.value,
            image: "",
            visible: false,
            installed: false
        };

        this.ApplicationsManagerService.addApplication((err, response) => {
            if (err) {
                console.log(err);
                return;
            }
            let imagePath = response.path + '/img.jpg';
            this.DSUStorage.setItem(imagePath, this.image, (err, url) => {
                if (err) {
                    console.log(err);
                    return;
                }
                appDetails.image = '/download' + url + '?' + Math.random();

                this.DSUStorage.setItem(response.path + '/data', JSON.stringify(appDetails), (err, url) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    this.History.navigateToPageByTag('accept-applications');
                });
            });
        })

    }

    _emitFeedback(event, message, alertType) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (typeof this.feedbackEmitter === 'function') {
            this.feedbackEmitter(message, "Validation", alertType)
        }
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
}