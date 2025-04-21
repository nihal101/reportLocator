import { LightningElement, api } from 'lwc';
export default class SearchableCombobox extends LightningElement {

    // Used to store picklist option.
    @api options;
    // Used to store selected option from dropdown.
    @api selectedOption = {"label": '', "value": ''};
    @api placeholder = 'Search an Option...'
    @api showMessageOnEmptyOptions;
    listOfOptions;

    showDropdown(event) {
        let dropDownList = this.template.querySelector('[data-id="drop-down-list"]');
        if(dropDownList) {
            dropDownList.classList.remove("slds-hide");
        }
    }

    connectedCallback() {
        this.listOfOptions = JSON.parse(JSON.stringify(this.options));
        let selectedOption = [];
        if(this.options) {
                selectedOption = this.options.filter(option => {
                return option.value === this.selectedOption.value;
            });
        }
        if(selectedOption.length > 0) {
            this.selectedOption = selectedOption[0];
        }else {
           this.selectedOption = {"label": '', "value": ''}; 
        }
    }
    getSelectedOption(event) {
        let rowIndex = event.currentTarget.dataset.index;
        this.selectedOption = this.listOfOptions[rowIndex];
        let dropDownList = this.template.querySelector('[data-id="drop-down-list"]');
        if(dropDownList) {
            dropDownList.classList.add("slds-hide");
        }
        let selectedOption = new CustomEvent('selectedvalue', {
            detail: this.selectedOption
        });
        this.dispatchEvent(selectedOption);
        this.listOfOptions = this.options;
    }
    handleChange(event) {
        if(!event.target.value.trim()) {
            this.listOfOptions = this.options;
        }
        else if(this.options) {
            let filteredOption = this.options.filter(option => {
                return option.label.toLowerCase().includes(event.detail.value.toLowerCase());
            });
            if(filteredOption.length <= 0) {
                this.listOfOptions = null;
            }else {
                this.listOfOptions = filteredOption;
            }
        }else {
            this.listOfOptions = null;
        }
    }
}