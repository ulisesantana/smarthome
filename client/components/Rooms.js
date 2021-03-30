import { LitElement, html, css } from 'https://unpkg.com/lit-element/lit-element.js?module'
import { DeviceController } from '../DeviceController.js'

class Rooms extends LitElement {
  static get properties () {
    return {
      generateUpdateDevicesHandler: { type: Function }
    }
  }

  static get styles () {
    return [
      css`
        .Rooms {
          align-items: center;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          list-style: none;
          padding: 0;
          width: 100%;
        }
      `
    ]
  }

  render () {
    return html`
        <div class="Rooms">

            <button
                    @click=${this.generateUpdateDevicesHandler(DeviceController.toggleOffice)}
            >
                OFFICE
            </button>

            <button
                    @click=${this.generateUpdateDevicesHandler(DeviceController.toggleBedroom)}
            >
                BED
                <wbr>
                ROOM
            </button>
        </div>
    `
  }
}

customElements.define('device-rooms', Rooms)
