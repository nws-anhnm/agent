import { assertEnum, assertUInt8 } from '../assert';
import { UhkBuffer } from '../uhk-buffer';
import { Helper as KeyActionHelper, KeyAction, NoneAction, PlayMacroAction, SwitchKeymapAction } from './key-action';
import { Macro } from './macro';

enum PointerRole {
    none,
    move,
    scroll
}

export class Module {

    @assertUInt8
    id: number;

    keyActions: KeyAction[];

    @assertEnum(PointerRole)
    pointerRole: PointerRole;

    constructor(other?: Module) {
        if (!other) {
            return;
        }
        this.id = other.id;
        this.keyActions = other.keyActions.map(keyAction => KeyActionHelper.createKeyAction(keyAction));
        this.pointerRole = other.pointerRole;
    }

    fromJsonObject(jsonObject: any, macros?: Macro[]): Module {
        this.id = jsonObject.id;
        this.pointerRole = PointerRole[<string>jsonObject.pointerRole];
        this.keyActions = jsonObject.keyActions.map((keyAction: any) => {
            return KeyActionHelper.createKeyAction(keyAction, macros);
        });
        return this;
    }

    fromBinary(buffer: UhkBuffer, macros?: Macro[]): Module {
        this.id = buffer.readUInt8();
        this.pointerRole = buffer.readUInt8();
        const keyActionsLength: number = buffer.readCompactLength();
        this.keyActions = [];
        for (let i = 0; i < keyActionsLength; ++i) {
            this.keyActions.push(KeyActionHelper.createKeyAction(buffer, macros));
        }
        return this;
    }

    toJsonObject(macros?: Macro[]): any {
        return {
            id: this.id,
            pointerRole: PointerRole[this.pointerRole],
            keyActions: this.keyActions.map(keyAction => {
                if (keyAction && (macros || !(keyAction instanceof PlayMacroAction || keyAction instanceof SwitchKeymapAction))) {
                    return keyAction.toJsonObject(macros);
                }
            })
        };
    }

    toBinary(buffer: UhkBuffer, macros?: Macro[]): void {
        buffer.writeUInt8(this.id);
        buffer.writeUInt8(this.pointerRole);

        const noneAction = new NoneAction();

        const keyActions: KeyAction[] = this.keyActions.map(keyAction => {
            if (keyAction) {
                return keyAction;
            }
            return noneAction;
        });

        buffer.writeArray(keyActions, (uhkBuffer: UhkBuffer, keyAction: KeyAction) => {
            keyAction.toBinary(uhkBuffer, macros);
        });
    }

    toString(): string {
        return `<Module id="${this.id}" pointerRole="${this.pointerRole}">`;
    }

    renameKeymap(oldAbbr: string, newAbbr: string): Module {
        let keyActions: KeyAction[];
        let keyActionModified = false;
        this.keyActions.forEach((keyAction, index) => {
            if (!keyAction) { return; }
            const newKeyAction = keyAction.renameKeymap(oldAbbr, newAbbr);
            if (newKeyAction !== keyAction) {
                if (!keyActionModified) {
                    keyActions = this.keyActions.slice();
                    keyActionModified = true;
                }
                keyActions[index] = newKeyAction;
            }
        });
        if (keyActionModified) {
            const newModule = Object.assign(new Module(), this);
            newModule.keyActions = keyActions;
            return newModule;
        }
        return this;
    }

}
