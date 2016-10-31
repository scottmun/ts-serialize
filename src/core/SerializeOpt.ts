import {Unmarshaller, defaultUnmarshaller, Marshaller, defaultMarshaller} from "./Transformer";
import Clazz from "../utils/Clazz";
import {Optional, None, Some} from "../utils/Optional";
import {JsValue, Json} from "../utils/Json";
import {UnmarshallError} from "../error/UnmarshallError";
import {Either, Left, Right} from "../utils/Either";
import Serialize from "./Serialize";


function isNoneJsValue(value : any ) : boolean {
    return value === undefined || value === null;
}

const NoneJsValue = null;


const SerializeOpt = function< T >( type : Function, jsonPropertyName ?: string, unmarshaller : Unmarshaller< T > = defaultUnmarshaller, marshaller : Marshaller< T > = defaultMarshaller ) {
    const optUnmarshaller : Unmarshaller< Optional< T > > = (value : JsValue, json : Json, clazz : any, jsonPropertyName : string, classPropertyName : string, target : Clazz< any >, mbType : Optional< Function >, jsonPath : string[], classPath : string[]) : Either< UnmarshallError[], Optional< T > > => {

        if( isNoneJsValue(value) ) {
            return Right< UnmarshallError[], Optional< T > >(None);
        }

        return unmarshaller(value, json, clazz, jsonPropertyName, classPropertyName, target, mbType, jsonPath, classPath)
            .fold< Either< UnmarshallError[], Optional< T > > >(
                e => Left< UnmarshallError[], Optional< T > >(e),
                v => Right< UnmarshallError[], Optional< T > >(Some< T >(v))
            );
    };

    const optMarshaller : Marshaller< Optional< T > > = (value : Optional< T >, json : Json, clazz : any, jsonPropertyName : string, classPropertyName : string, target : Clazz< any >, mbType : Optional< Function >) => {
        if(value.isEmpty) {
            return NoneJsValue;
        } else {
            return marshaller(value.get(), json, clazz, jsonPropertyName, classPropertyName, target, mbType);
        }
    };

    return Serialize< Optional< T > >(jsonPropertyName, optUnmarshaller, optMarshaller, Some(type));
};

export default SerializeOpt;