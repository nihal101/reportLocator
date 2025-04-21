import { LightningElement, api } from 'lwc';
export default class SearchInputBox extends LightningElement {

    @api placeholder;
    @api isLoading;

    /*************************
     * Method is used to show spinner in input box while getting result from server.
    */
    get showSpinner() {
        return this.isLoading;
    }

    handleInputChange(event) {
        this.dispatchEvent(
            new CustomEvent("inputchange", {
                detail : {
                    value : event.target.value
                }
            })
        );
    }
}