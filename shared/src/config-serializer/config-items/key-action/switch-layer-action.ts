import { assertEnum } from '../../assert';
import { UhkBuffer } from '../../uhk-buffer';
import { KeyAction, KeyActionId, keyActionType } from './key-action';

export enum LayerName {
    mod,
    fn,
    mouse
}

export class SwitchLayerAction extends KeyAction {

    isLayerToggleable: boolean;

    @assertEnum(LayerName)
    layer: LayerName;

    constructor(other?: SwitchLayerAction) {
        super();
        if (!other) {
            return;
        }
        this.isLayerToggleable = other.isLayerToggleable;
        this.layer = other.layer;
    }

    fromJsonObject(jsonObject: any): SwitchLayerAction {
        this.assertKeyActionType(jsonObject);
        this.layer = LayerName[<string>jsonObject.layer];
        this.isLayerToggleable = jsonObject.toggle;
        return this;
    }

    fromBinary(buffer: UhkBuffer): SwitchLayerAction {
        this.readAndAssertKeyActionId(buffer);
        this.layer = buffer.readUInt8();
        this.isLayerToggleable = buffer.readBoolean();
        return this;
    }

    toJsonObject(): any {
        return {
            keyActionType: keyActionType.SwitchLayerAction,
            layer: LayerName[this.layer],
            toggle: this.isLayerToggleable
        };
    }

    toBinary(buffer: UhkBuffer) {
        buffer.writeUInt8(KeyActionId.SwitchLayerAction);
        buffer.writeUInt8(this.layer);
        buffer.writeBoolean(this.isLayerToggleable);
    }

    toString(): string {
        return `<SwitchLayerAction layer="${this.layer}" toggle="${this.isLayerToggleable}">`;
    }

}
