import {Optional, None, Some, Either, Left, Right} from "scalts"
import {JsValue, Json} from "ts-json-definition"

import {Unmarshaller, defaultUnmarshaller, Marshaller, defaultMarshaller} from "../transformers"
import UnmarshallError from "../errors/UnmarshallError"
import Serialize from "./Serialize"


const NoneJsValue = null;


const SerializeOpt = function< T >(type: Function, jsonPropertyName ?: string, unmarshaller: Unmarshaller< T > = defaultUnmarshaller, marshaller: Marshaller< T > = defaultMarshaller) {
    const optUnmarshaller: Unmarshaller< Optional< T > > = (jsValue: JsValue, json: Json, clazz: any, jsonPropertyName: string, classPropertyName: string, target: Function, mbType: Optional< Function >, jsonPath: string[], classPath: string[]): Either< UnmarshallError[], Optional< T > > => {
        return Optional.apply(jsValue).fold(() => Right< UnmarshallError[], Optional< T > >(None), value => {
            return unmarshaller(value, json, clazz, jsonPropertyName, classPropertyName, target, mbType, jsonPath, classPath)
                .fold(
                    e => Left< UnmarshallError[], Optional< T > >(e),
                    v => Right< UnmarshallError[], Optional< T > >(Some< T >(v))
                );
        });
    };

    const optMarshaller: Marshaller< Optional< T > > = (value: Optional< T >, json: Json, clazz: any, jsonPropertyName: string, classPropertyName: string, target: Function, mbType: Optional< Function >) => {
        if (value.isEmpty) {
            return NoneJsValue;
        } else {
            return marshaller(value.get(), json, clazz, jsonPropertyName, classPropertyName, target, mbType);
        }
    };

    return Serialize< Optional< T > >(jsonPropertyName, optUnmarshaller, optMarshaller, Some(type));
};

export default SerializeOpt;