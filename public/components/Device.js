import { LitElement, html, css } from 'https://unpkg.com/lit-element/lit-element.js?module'

class Device extends LitElement {
  static get properties () {
    return {
      id: { type: String },
      name: { type: String },
      type: { type: String },
      brightness: { type: Number },
      colorTemp: { type: Number },
      power: { type: Boolean },
      clickHandler: { type: Function }
    }
  }

  static get styles () {
    return [
      css`
        :host {
          --container-size: 96px;
        }
        
        .Device {
          background-color: white;
          border-radius: 24px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: var(--container-size);
          margin: 16px;
          padding: 16px;
          width: var(--container-size);
        }
        
        .off {
          opacity: 50%;
        }
        
        .on .power {
          color: #ffcc01;
        }

        .off .power {
          color: #333;
        }
        
        .power .material-icons {
          font-size: 32px;
          filter: drop-shadow(0 0 3px #333);
        }
        
        .title {
          font-size: 1rem;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (min-width: 768px) {
          :host {
            --container-size: 144px;
          }
        }
      `
    ]
  }

  render () {
    return html`
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <div 
                id=${this.id} 
                class="Device ${this.power ? 'on' : 'off'}"
                @click=${() => this.clickHandler(this.id)}
        >
            <span class="power">
                <i class="material-icons">${this.type === 'plug' ? 'power' : 'emoji_objects'}</i>
            </span>
            <span class="title">${this.name}</span>
        </div>
    `
  }
}

customElements.define('device-item', Device)
