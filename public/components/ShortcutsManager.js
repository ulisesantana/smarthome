import { LitElement, html, css } from 'https://unpkg.com/lit-element/lit-element.js?module'

class ShorcutsManager extends LitElement {
  constructor () {
    super()
    this.shortcuts = []
  }

  static get properties () {
    return {
      generateUpdateDevicesHandler: { type: Function },
      shortcuts: { type: Array }
    }
  }

  static get styles () {
    return [
      css`
        .ShorcutsManager {
          align-items: center;
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr 1fr;
          list-style: none;
          margin: 0;
          padding: 0;
          width: 100%;
        }
        
        li {
          display: flex;
          justify-content: center;
        }
        
        button {
          align-items: center;
          background-color: white;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: 1fr;
          gap: 0px 0px;
          grid-template-areas: "icon text text";
          height: 48px;
          justify-self: center;
          overflow: hidden;
          padding: 4px 8px;
          text-overflow: ellipsis;
          width: 128px;
        }

        button i {
          grid-area: icon;
        }

        button span {
          grid-area: text;
        }
        
        button:first-child {
          margin-left: 0;
        }
        button:last-child {
          margin-right: 0;
        }
        
        @media (min-width: 768px){
          .ShorcutsManager {
            align-items: center;
            display: flex;
            justify-content: space-around;
          }
          
          button {
            padding: 8px 16px;
            width: 144px;
          }
        }      
      `
    ]
  }

  render () {
    return html`
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <ul class="ShorcutsManager">
            ${this.shortcuts.map(({ onClick, icon, color, text }) => html`<li>
                <button @click=${this.generateUpdateDevicesHandler(onClick)}>
                    <i class="material-icons" style="color: ${color}">${icon}</i>
                    <span>${text}</span>
                </button>
            </li>`)}
        </ul>
    `
  }
}

customElements.define('device-shortcuts', ShorcutsManager)
