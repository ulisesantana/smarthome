import { LitElement, html, css } from 'https://unpkg.com/lit-element/lit-element.js?module'
import './Device.js'

class DeviceList extends LitElement {
  static get properties () {
    return {
      devices: { type: Array },
      handleToggleDevice: { type: Function }
    }
  }

  static get styles () {
    return [
      css`
        .DeviceList {
          display: flex;
          flex-wrap: wrap;
          list-style: none;
          padding: 0;
          margin-top: -16px;
        }
      `
    ]
  }

  render () {
    return html`
        <ul class="DeviceList">
           ${this.devices.map(({ id, name, type, power, brightness, colorTemp }) =>
                   html`<li>
                       <device-item 
                               .id=${id}
                               .name=${name}
                               .power=${power}
                               .type=${type}
                               .brightness=${brightness}
                               .colorTemp=${colorTemp}
                               .clickHandler=${this.handleToggleDevice.bind(this)}
                       >
                       </device-item>
                   </li>`)}
          </ul>
`
  }
}

customElements.define('device-list', DeviceList)
