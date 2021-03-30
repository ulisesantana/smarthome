import { LitElement, html, css } from 'https://unpkg.com/lit-element/lit-element.js?module'
import { DeviceController } from '../DeviceController.js'

class Scenes extends LitElement {
  static get properties () {
    return {
      generateUpdateDevicesHandler: { type: Function }
    }
  }

  static get styles () {
    return [
      css`
        .Scenes {
          align-items: center;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 0;
          width: 100%;
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
          grid-template-areas: "icon text text";;
          height: 48px;
          justify-self: center;
          padding: 8px 16px;
          width: 144px;
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
      `
    ]
  }

  render () {
    return html`
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <div class="Scenes">
            <button @click=${this.generateUpdateDevicesHandler(DeviceController.toggleDayScene)}>
                <i class="material-icons" style="color: darkorange">wb_sunny</i>
                <span>DAY</span>
            </button>
            <button @click=${this.generateUpdateDevicesHandler(DeviceController.toggleNightScene)}>
                <i class="material-icons" style="color: dodgerblue">brightness_2</i>
                <span>NIGHT</span>
            </button>
            <button @click=${this.generateUpdateDevicesHandler(DeviceController.toggleRelaxScene)}>
                <i class="material-icons" style="color: teal">self_improvement</i>
                <span>RELAX</span>
            </button>
            <button @click=${this.generateUpdateDevicesHandler(DeviceController.toggleMovieScene)}>
                <i class="material-icons" style="color: red">theaters</i>
                <span>MOVIE</span>
            </button>
        </div>
    `
  }
}

customElements.define('device-scenes', Scenes)
