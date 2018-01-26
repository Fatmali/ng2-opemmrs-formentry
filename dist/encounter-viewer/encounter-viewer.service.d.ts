import { NodeBase } from '../form-entry/form-factory/form-node';
export declare class EncounterViewerService {
    constructor();
    findFormAnswerLabel(answerUuid: string, schema: any): string;
    hasAnswer(node: NodeBase): boolean;
    questionsAnswered(node: any, answered?: boolean[]): boolean;
    isDate(val: any): boolean;
    convertTime(unixTimestamp: number): any;
}
