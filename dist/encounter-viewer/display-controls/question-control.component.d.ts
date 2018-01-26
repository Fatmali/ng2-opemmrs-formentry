import { EncounterViewerService } from '../encounter-viewer.service';
export declare class QuestionControlComponent {
    private encounterService;
    schema: any;
    value: any;
    dataSource: any;
    private innerValue;
    private _schema;
    private _dataSource;
    constructor(encounterService: EncounterViewerService);
    isUuid(value: string): boolean;
    writeValue(v: any, arrayElement?: boolean): any;
    isDate(str: string): boolean;
}
