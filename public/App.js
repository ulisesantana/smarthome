import { LitElement, html, css } from 'https://unpkg.com/lit-element/lit-element.js?module'
import './components/DeviceList.js'
import './components/ShortcutsManager.js'
import { DeviceController } from './DeviceController.js'

class App extends LitElement {
  constructor () {
    super()
    this.devices = []
    this.rooms = [
      { onClick: DeviceController.toggleOffice, icon: 'work', color: '#2B78FE', text: 'OFFICE' },
      { onClick: DeviceController.toggleBedroom, icon: 'king_bed', color: 'deeppink', text: 'BEDROOM' }
    ]
    this.scenes = [
      { onClick: DeviceController.toggleDayScene, icon: 'wb_sunny', color: 'darkorange', text: 'DAY' },
      { onClick: DeviceController.toggleNightScene, icon: 'bedtime', color: 'dodgerblue', text: 'NIGHT' },
      { onClick: DeviceController.toggleRelaxScene, icon: 'self_improvement', color: 'teal', text: 'RELAX' },
      { onClick: DeviceController.toggleMovieScene, icon: 'theaters', color: 'red', text: 'MOVIE' }
    ]
    this.setDevicesHandler(DeviceController.getDevices)()
      .then(() => console.debug('App started.'))
  }

  setDevicesHandler (cb) {
    return async (...args) => {
      // eslint-disable-next-line standard/no-callback-literal
      this.devices = await cb(...args)
      console.debug('Devices updated.', this.devices)
    }
  }

  static get properties () {
    return {
      devices: { type: Array }
    }
  }

  static get styles () {
    return [
      css`
        main {
          align-items: start;
          display: flex;
          flex-direction: column;
          flex-wrap: wrap;
          justify-content: space-between;
          height: 100%;
          width: 100%;
        }
        
        h1 {
          color: white;
        }
        
        h1:first-child {
          margin-top: 0;
        }
      `
    ]
  }

  render () {
    return html`
        <main class="App">
            <h1>Rooms</h1>
            <device-shortcuts 
                    style="width: calc(100%)"
                    .shortcuts=${this.rooms}
                    .generateUpdateDevicesHandler=${this.setDevicesHandler.bind(this)}
            ></device-shortcuts>


            <h1>Scenes</h1>
            <device-shortcuts
                    style="width: calc(100%)"
                    .shortcuts=${this.scenes}
                    .generateUpdateDevicesHandler=${this.setDevicesHandler.bind(this)}
            ></device-shortcuts>


            <h1>Devices</h1>
            <device-list
                    style="width: calc(100%)"
                    .devices=${this.devices}
                    .handleToggleDevice=${this.setDevicesHandler(DeviceController.toggleDeviceById).bind(this)}
            ></device-list>
        </main>
    `
  }
}

customElements.define('device-app', App)
