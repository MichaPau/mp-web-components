class FormAssoTest extends HTMLElement {

  static formAssociated = true;
  private internals: ElementInternals;
  public _value = "0";
  public _name = "test";
  constructor() {
    super();

    this.internals = this.attachInternals();
    this._value = "0";
    this._name = "test";



    if ('FormDataEvent' in window) {
      console.log("formdata event is supported");
    }

    if ('ElementInternals' in window &&
        'setFormValue' in window.ElementInternals.prototype) {
      console.log("Form-associated custom elements are supported");
    }
  }

  connectedCallback() {
    const shadow = this.attachShadow(({ mode: "open", delegatesFocus: true  }));

    const input = document.createElement("input");
    input.setAttribute("type", "number");
    input.setAttribute("name", this._name);

    input.addEventListener("change", this.inputChangeHandler);

    shadow.appendChild(input);

    this.manageInternals();
    // this.internals.setFormValue(this.getFormData());
    // this.internals.setValidity({ valueMissing: true }, "my message");

  }

  manageInternals() {
    if (this._value !== "0" && this._value !== "") {
      let formData = new FormData();
      formData.append(this._name + "-test", this._value);
      this.internals.setValidity({});
      this.internals.setFormValue(formData);
    } else {
      this.internals.setValidity({ valueMissing: true }, "value must be non zero");
      this.internals.setFormValue(null);

    }
  }
  inputChangeHandler = (ev:Event) =>  {
    console.log("change:", (ev.target as HTMLInputElement).value);
    this._value = (ev.target as HTMLInputElement).value;

    this.manageInternals();
  }


   // get value() { return this._value; }
   // set value(v) { this._value = v; }

   // get form() { return this.internals.form; }
   // get name() { return this.getAttribute('name'); }
   // get type() { return this.localName; }
   get validity() {
     console.log("get validity");
     return this.internals.validity;
   }
   get validationMessage() {
     console.log("validationMessage");
     return this.internals.validationMessage;
   }
   get willValidate() {
     console.log("willVallidate");
     return this.internals.willValidate;
   }

   checkValidity() {
     console.log("checkValidity");
     return this.internals.checkValidity();
   }
   reportValidity() {
     console.log("repportValidity");
     return this.internals.reportValidity();
   }
}

customElements.define('form-asso-test', FormAssoTest)
