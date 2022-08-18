interface RequiredBodyParamsMap {
    [key: string]: boolean;
}
interface ValidationMap {
    [key: string]: Function;
}
export declare function requireBodyParams(requiredBodyParamsMap?: RequiredBodyParamsMap): (req: any, res: any, next: any) => void;
export declare function validateBodyParams(bodyKeyToValidatorMap?: ValidationMap): (req: any, res: any, next: any) => void;
export {};
