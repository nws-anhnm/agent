import { UhkBuffer } from '../../uhk-buffer';
import { MacroAction, MacroActionId, macroActionType } from './macro-action';

export class TextMacroAction extends MacroAction {

    text: string;

    constructor(other?: TextMacroAction) {
        super();
        if (!other) {
            return;
        }
        this.text = other.text;
    }

    fromJsonObject(jsObject: any): TextMacroAction {
        this.assertMacroActionType(jsObject);
        this.text = jsObject.text;
        return this;
    }

    fromBinary(buffer: UhkBuffer): TextMacroAction {
        this.readAndAssertMacroActionId(buffer);
        this.text = buffer.readString();
        return this;
    }

    toJsonObject(): any {
        return {
            macroActionType: macroActionType.TextMacroAction,
            text: this.text
        };
    }

    toBinary(buffer: UhkBuffer) {
        buffer.writeUInt8(MacroActionId.TextMacroAction);
        buffer.writeString(this.text);
    }

    toString(): string {
        return `<TextMacroAction text="${this.text}">`;
    }
}
