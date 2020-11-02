import ModalController from '../../cardinal/controllers/base-controllers/ModalController.js';

export default class ShareQRCodeController extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.copyToClipboardOnClick();
    }

    copyToClipboardOnClick() {
        this.on('copy-to-clipboard-on-click', (event) => {
            var dummy = document.createElement("textarea");
            document.body.appendChild(dummy);
            dummy.value = this.model.data.identifier;
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
        });
    }
}
