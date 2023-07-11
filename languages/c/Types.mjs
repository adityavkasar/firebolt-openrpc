/*
 * Copyright 2021 Comcast Cable Communications Management, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import deepmerge from 'deepmerge'
import { getPath } from '../../src/shared/json-schema.mjs'
import { getTypeName, getModuleName, description, getObjectHandleManagement, getNativeType, getPropertyAccessors, capitalize, isOptional, generateEnum, getMapAccessors, getArrayAccessors, getArrayElementSchema, getPropertyGetterSignature, getPropertyEventCallbackSignature, getPropertyEventRegisterSignature, getPropertyEventUnregisterSignature, getPropertySetterSignature, getFireboltStringType } from './src/types/NativeHelpers.mjs'
import { getArrayAccessorsImpl, getMapAccessorsImpl, getObjectHandleManagementImpl, getParameterInstantiation, getPropertyAccessorsImpl, getResultInstantiation, getCallbackParametersInstantiation, getCallbackResultInstantiation, getCallbackResponseInstantiation } from './src/types/ImplHelpers.mjs'
import { getJsonContainerDefinition, getJsonDataStructName } from './src/types/JSONHelpers.mjs'
import { localizeDependencies } from '../../src/shared/json-schema.mjs'

const getSdkNameSpace = () => 'FireboltSDK'
const getJsonNativeTypeForOpaqueString = () => getSdkNameSpace() + '::JSON::String'
const getEnumName = (name, prefix) => ((prefix.length > 0) ? (prefix + '_' + name) : name)

const getRefModule = (title) => {
  let module = {
    info: {
      title: `${title}`
    }
  }
  return module
}

const hasProperties = (prop) => {
  let hasProperty = false
  if (prop.properties) {
     hasProperty = true
  } else if (prop.additionalProperties && ( prop.additionalProperties.type && (((prop.additionalProperties.type === 'object') && prop.additionalProperties.properties) || (prop.additionalProperties.type !== 'object')))) {
     hasProperty = true
  }
  return hasProperty
}

function validJsonObjectProperties(json = {}) {

  let valid = true
  if (json.type === 'object' || (json.additonalProperties && typeof json.additonalProperties.type === 'object')) {
    if (json.properties || json.additonalProperties) {
      Object.entries(json.properties || json.additonalProperties).every(([pname, prop]) => {
        if (!prop['$ref'] && (pname !== 'additionalProperties') &&
           ((!prop.type && !prop.const && (prop.schema && !prop.schema.type)) || (Array.isArray(prop.type) && (prop.type.find(t => t === 'null'))))) {
          valid = false
        }
        return valid
      })
    }
  }
  return valid
}

function union(schemas, module, commonSchemas) {

  const result = {};
  for (const schema of schemas) {
    for (const [key, value] of Object.entries(schema)) {
      if (!result.hasOwnProperty(key)) {
        // If the key does not already exist in the result schema, add it
        if (value && value.anyOf) {
          result[key] = union(value.anyOf, module, commonSchemas)
        } else if (key === 'title' || key === 'description' || key === 'required') {
          //console.warn(`Ignoring "${key}"`)
        } else {
          result[key] = value;
        }
      } else if (key === 'type') {
        // If the key is 'type', merge the types of the two schemas
        if(result[key] === value) {
          //console.warn(`Ignoring "${key}" that is already present and same`)
        } else {
          console.warn(`ERROR "${key}" is not same -${JSON.stringify(result, null, 4)} ${key} ${result[key]} - ${value}`);
          throw "ERROR: type is not same"
        }
      } else {
        //If the Key is a const then merge them into an enum
        if(value && value.const) {
          if(result[key].enum) {
            result[key].enum = Array.from(new Set([...result[key].enum, value.const]))
          }
          else {
            result[key].enum = Array.from(new Set([result[key].const, value.const]))
            delete result[key].const
          }
        }
        // If the key exists in both schemas and is not 'type', merge the values
        else if (Array.isArray(result[key])) {
          // If the value is an array, concatenate the arrays and remove duplicates
          result[key] = Array.from(new Set([...result[key], ...value]))
        } else if (result[key] && result[key].enum && value && value.enum) {
          //If the value is an enum, merge the enums together and remove duplicates
          result[key].enum = Array.from(new Set([...result[key].enum, ...value.enum]))
        } else if (typeof result[key] === 'object' && typeof value === 'object') {
          // If the value is an object, recursively merge the objects
          result[key] = union([result[key], value], module, commonSchemas);
        } else if (result[key] !== value) {
          // If the value is a primitive and is not the same in both schemas, ignore it
          //console.warn(`Ignoring conflicting value for key "${key}"`)
        }
      }
    }
  }
  return result;
}

function getMergedSchema(module, json, name, schemas) {
  let refsResolved = [...json.anyOf.map(x => x['$ref'] ? getPath(x['$ref'], module, schemas) || x : x)]
  let allOfsResolved = refsResolved.map(sch => sch.allOf ? deepmerge.all([...sch.allOf.map(x => x['$ref'] ? getPath(x['$ref'], module, schemas) || x : x)]) : sch)

  let mergedSchema = union(allOfsResolved, module, schemas)
  if (json.title) {
    mergedSchema['title'] = json.title
  }
  else {
    mergedSchema['title'] = name
  }

  delete mergedSchema['$ref']
  return mergedSchema
}

const deepMergeAll = (module, name, schema, schemas, options) => {
  let nonRefsProperty = [...schema.allOf.map(x => x['$ref'] ? '' : x)].filter(elm => elm)
  let refsProperty = [...schema.allOf.map(x => x['$ref'] ? getPath(x['$ref'], module, schemas) : '')].filter(elm => elm)
  let mergedProperty = []
  let mergedParamSchema = {
    type: "object",
    properties: {}
  }

  nonRefsProperty.forEach(p => {
    if (p.properties) {
      Object.entries(p.properties).every(([pname, prop]) => {
        let present = false
        refsProperty.forEach(refP => {
          if (refP.properties) {
            Object.entries(refP.properties).every(([refname, refprop]) => {
              if (refname == pname) {
                present = true
              }
              return !present
            })
          }
        })
        let prefixedName = (present == false) ? (name + capitalize(pname)) : pname
        mergedParamSchema.properties[prefixedName] = prop
        return true
      })
      mergedProperty.push(mergedParamSchema)
    }
  })
  refsProperty.forEach(ref => mergedProperty.push(ref))
  let union = deepmerge.all(mergedProperty)

  return union
}
const hasTag = (method, tag) => {
  return method.tags && method.tags.filter(t => t.name === tag).length > 0
}

function getParamList(schema, module) {
  let paramList = []
  if (schema.params.length > 0) {
    schema.params.map(p => {
      /*
        param = {name='', nativeType='', jsonType='', required=boolean}
      */
      let param = {}
      param['nativeType'] = getSchemaType(p.schema, module, { title: true, name: p.name })
      param['jsonType'] = getJsonType(p.schema, module, {name: p.name})
      param['name'] = p.name
      param['required'] = p.required
      paramList.push(param)
    })

  }
  return paramList
}

function getMethodSignature(method, module, { destination, isInterface = false }) {

  let signature = ''
  if (hasTag(method, 'property') || hasTag(method, 'property:readonly') || hasTag(method, 'property:immutable')) {
    let paramList = getParamList(method, module)
    let resultType = method.result && getSchemaType(method.result.schema, module, { title: true, name: method.result.name, resultSchema: true}) || ''

    signature = getPropertyGetterSignature(method, module, resultType, paramList) + ';\n\n'

    if (hasTag(method, 'property')) {
      signature += getPropertySetterSignature(method, module, resultType, paramList) + ';\n\n'
    }
  }
  return signature
}

function getMethodSignatureParams(method, module, { destination, callback= false } = {}) {

  const result = method.params.map(param => {
    let type = getSchemaType(param.schema, module, { name: param.name, title: true, destination })
    if ((callback === true) && (type === 'char*')) {
      type = getFireboltStringType()
    }
    return type + (!param.required ? '* ' : ' ') + param.name
  }).join(', ')

  return result
}

const safeName = val => val.split(':').pop().replace(/[\.\-]/g, '_').replace(/\+/g, '_plus').replace(/([a-z])([A-Z0-9])/g, '$1_$2').toUpperCase()

function getSchemaType(schema, module, { name, moduleTitle, prefix = '', destination, resultSchema = false, link = false, title = false, code = false, asPath = false, event = false, expandEnums = true, baseUrl = '' } = {}) {
  let info = getSchemaTypeInfo(module, schema, name, module['x-schemas'], prefix, { title: title, moduleTitle: moduleTitle, resultSchema: resultSchema, event: event })

  return info.type
}

function getSchemaTypeInfo(module = {}, json = {}, name = '', schemas = {}, prefix = '', options = {moduleTitle: '', level: 0, descriptions: true, title: false, resultSchema: false, event: false}) {

  if (json.schema) {
    json = json.schema
  }

  let stringAsHandle = options.resultSchema || options.event

  let structure = {}
  structure["type"] = ''
  structure["json"] = []
  structure["name"] = {}
  structure["namespace"] = {}

  if (json['$ref']) {
    if (json['$ref'][0] === '#') {
      //Ref points to local schema
      //Get Path to ref in this module and getSchemaType
      let definition = getPath(json['$ref'], module, schemas)
      let tName = definition.title || json['$ref'].split('/').pop()
      let schema = module
      if (json['$ref'].includes('x-schemas')) {
        options.moduleTitle = json['$ref'].split('/')[2]
        schema = getRefModule(options.moduleTitle)
      }

      const res = getSchemaTypeInfo(schema, definition, tName, schemas, '', options)
      structure.type = res.type
      structure.json = res.json
      structure.name = res.name
      structure.namespace = res.namespace
      return structure
    }
  }
  else if (json.const) {
    structure.type = getNativeType(json, stringAsHandle)
    structure.json = json
    return structure
  }
  else if (json['x-method']) {
    console.log(`WARNING UNHANDLED: x-method in ${name}`)
    return structure
    //throw "x-methods not supported yet"
  }
  else if (json.type === 'string' && json.enum) {
    //Enum
    structure.name = name || json.title
    let typeName = getTypeName(getModuleName(module), json.title || name, prefix, false, false)
//    let res = description(capitalize(name || json.title), json.description) + '\n' + generateEnum(json, typeName)
    structure.json = json
    structure.type = typeName
    structure.namespace = getModuleName(module)
    return structure
  }
  else if (Array.isArray(json.type)) {
    let type = json.type.find(t => t !== 'null')
    let sch = JSON.parse(JSON.stringify(json))
    sch.type = type
    return getSchemaTypeInfo(module, sch, name, schemas, prefix, options)
  }
  else if (json.type === 'array' && json.items && (validJsonObjectProperties(json) === true)) {
    let res = ''
    if (Array.isArray(json.items)) {
            //TODO
      const IsHomogenous = arr => new Set(arr.map( item => item.type ? item.type : typeof item)).size === 1
      if (!IsHomogenous(json.items)) {
        throw 'Heterogenous Arrays not supported yet'
      }
      res = getSchemaTypeInfo(module, json.items[0], json.items[0].name || name, schemas, prefix)
    }
    else {
      // grab the type for the non-array schema
      res = getSchemaTypeInfo(module, json.items, json.items.name || name, schemas, prefix)
    }

    let arrayName = capitalize(res.name)// + capitalize(res.json.type)
    try {
      let n = getTypeName(getModuleName(module),  json.title || name, prefix)
      structure.name = res.name || name && (capitalize(name))
      structure.type = n  
    }
    catch (e) {
      console.dir(json)
    }
    structure.json = json
    structure.namespace = getModuleName(module)
    return structure
  }
  else if (json.allOf) {
    let title = json.title ? json.title : name
    let union = deepMergeAll(module, title, json, schemas, options)
    union['title'] = title

    delete union['$ref']
    return getSchemaTypeInfo(module, union, '', schemas, '', options)
  }
  else if (json.oneOf) {
    structure.type = 'char*'
    structure.json.type = 'string'
    return structure
  }
  else if (json.anyOf) {
    let mergedSchema = getMergedSchema(module, json, name, schemas)
    let prefixName = ((prefix.length > 0) && (!name.startsWith(prefix))) ? prefix : capitalize(name)
    return getSchemaTypeInfo(module, mergedSchema, '', schemas, prefixName, options)
  }
  else if (json.type === 'object') {
    structure.json = json
    if (hasProperties(json)) {
      if (!json.title) {
        console.dir(json)
      }
      structure.type = getTypeName(options.moduleTitle || getModuleName(module), json.title || name, prefix)
      structure.name = (json.name ? json.name : (json.title ? json.title : name))
      structure.namespace = (json.namespace ? json.namespace : options.moduleTitle || getModuleName(module))
    }
    else {
      structure.type = 'char*'
    }
    if (name) {
      structure.name = capitalize(name)
    }

    return structure
  }
  else if (json.type) {
    structure.type = getNativeType(json, stringAsHandle)
    structure.json = json
    if (name || json.title) {
      structure.name = capitalize(json.title || name)
    }
    structure.namespace = getModuleName(module)

    return structure
  }
  return structure
}

// function getSchemaShape(json, module, { name = '', prefix = '', level = 0, title, summary, descriptions = true, destination = '', section = '', enums = true } = {}) {
//   let shape = getSchemaShapeInfo(json, module, module['x-schemas'], { name, prefix, merged: false, level, title, summary, descriptions, destination, section, enums })
//     return shape
// }

function getSchemaShape(schema = {}, module = {}, { name = '',  property = '', moduleTitle = '', level = 0, title, summary, descriptions = true, destination, enums = true } = {}) {
  schema = JSON.parse(JSON.stringify(schema))
  let structure = []

  let prefix = (level === 0 ? 'typedef ' : '')
  let operator = ''
  let theTitle = schema.title || name

  theTitle = theTitle ? getTypeName(moduleTitle || module.info.title, theTitle) : 'Unknown' //`${moduleTitle || module.info.title}_${theTitle}` 

  if (enums && level === 0 && schema.type === "string" && Array.isArray(schema.enum)) {
    return `typedef enum {\n\t` + schema.enum.map(value => theTitle.toUpperCase() + '_' + value.split(':').pop().replace(/[\.\-]/g, '_').replace(/\+/g, '_plus').replace(/([a-z])([A-Z0-9])/g, '$1_$2').toUpperCase()).join(',\n\t') + `\n} ${theTitle};\n`
  }

  if (!theTitle) {
    prefix = operator = theTitle = ''
  }

  if (schema['$ref']) {
    if (level === 0) {
      return `${prefix}${theTitle};`
    }
    else {
      const someJson = getPath(schema['$ref'], module)
      let moduleTitle = module.info.title
      if (schema['$ref'].indexOf("/x-schemas/") >= 0) {
        moduleTitle = schema['$ref'].split('/')[2]
      }
      if (someJson) {
        return getSchemaShape(someJson, module, { name, property, moduleTitle, level, title, summary, descriptions, destination, enums: false })
      }
      else {
        '  '.repeat(level) + `${prefix}${theTitle}${operator}`
      }
    }
  }
  else if (schema.hasOwnProperty('const')) {
    // TODO...
    return '  '.repeat(level) + `${prefix}${theTitle}${operator} ` + JSON.stringify(schema.const)
  }
  else if (title && schema.title) {
    let summary = ''
    if (level > 0 && (summary || schema.description)) {
      summary = `\t// ${(summary || schema.description).split('\n')[0]}`
    }
    return '  '.repeat(level) + `${prefix}${theTitle}${operator} ${property}; ` + summary
  }
  else if (schema.type === 'array' && schema.items && Array.isArray(schema.items)) {
    if (schema.items.length === schema.items.filter(item => item['x-property']).length) {
      const object = JSON.parse(JSON.stringify(schema))
      object.type = 'object'
      object.properties = {}
      object.items.forEach(item => {
        object.properties[item['x-property']] = item
        delete item['x-property']
      })
      return getSchemaShape(object, module, { name, moduleTitle, level, title, summary, descriptions, destination, enums})  
    }
  }
  else if (schema.type === 'object') {
    let suffix = '{'

    structure.push('  '.repeat(level) + `${prefix}struct${operator} ${suffix}`)

    if (schema.properties) {
      Object.entries(schema.properties).forEach(([name, prop]) => {
        if (!schema.required || !schema.required.includes(name)) {
//          name = name + '?'
        }
        const schemaShape = getSchemaShape(prop, module, {property: name, summary: prop.description, descriptions: descriptions, level: level+1, title: true})
        structure.push(schemaShape)
      })
    }
    else if (schema.propertyNames) {
      const localizedSchema = localizeDependencies(schema, module)
      if (localizedSchema.propertyNames.enum) {
        localizedSchema.propertyNames.enum.forEach(prop => {
          let type = 'any'

          if (localizedSchema.additionalProperties && (typeof localizedSchema.additionalProperties === 'object')) {
            type = localizedSchema.additionalProperties
          }          

          if (localizedSchema.patternProperties) {
            Object.entries(localizedSchema.patternProperties).forEach(([pattern, schema]) => {
              let regex = new RegExp(pattern)
              if (prop.match(regex)) {
                type = schema
              }
            })
          }

//          return getSchemaShape(schema.propertyNames, module, { name: schema.title })
  
          structure.push(getSchemaShape(type, module, {property: safeName(prop), descriptions: descriptions, level: level+1}))
        })
      }
    }
    else if (schema.additionalProperties && (typeof schema.additionalProperties === 'object')) {
      let type = getSchemaType(schema.additionalProperties, module, { destination })
    // TODO: C doesn't support this...
    //      structure.push(getSchemaShape({type: type}, module, {name: '[property: string]', descriptions: descriptions, level: level+1}))
    }

    structure.push('  '.repeat(level) + `} ${theTitle};`)
  }
  else if (schema.anyOf) {
    return ''
    return '  '.repeat(level) + `${prefix}${theTitle}${operator} ` + schema.anyOf.map(s => getSchemaType(s, module, { name, level, title, summary, descriptions, destination })).join(' | ')
  }
  else if (schema.oneOf) {
    return ''
    return '  '.repeat(level) + `${prefix}${theTitle}${operator} ` + schema.oneOf.map(s => getSchemaType(s, module, { name, level, title, summary, descriptions, destination })).join(' | ')
  }
  else if (schema.allOf) {
    const merger = (key) => function(a, b) {
      if (a.const) {
        return JSON.parse(JSON.stringify(a))
      }
      else if (b.const) {
        return JSON.parse(JSON.stringify(b))
      }
      else {
        return deepmerge(a, b, {customMerge: merger})
      }
    }

    let union = deepmerge.all([...schema.allOf.map(x => x['$ref'] ? getPath(x['$ref'], module) || x : x).reverse()], {
      customMerge: merger
    })

    if (schema.title) {
      union.title = schema.title
    }
    delete union['$ref']

    return getSchemaShape(union, module, { name, level, title, summary, descriptions, destination })
  }
  else if (schema.type || schema.const) {
    const isArrayWithSchemaForItems = schema.type === 'array' && schema.items && !Array.isArray(schema.items)
    const isArrayWithSpecificItems = schema.type === 'array' && schema.items && Array.isArray(schema.items)
    
    // TODO: deal with fixed sized arrays vs arbitrary arrays
    let suffix
    let summary = ''

    if (schema.const) {
      suffix = JSON.stringify(schema.const)
    }
    else if (isArrayWithSchemaForItems) {
      suffix = getSchemaType(schema.items, module, { title: level ? true : false, name: name }) + '[]' // prefer schema title over robust descriptor
    }
    else if (isArrayWithSpecificItems) {
      suffix = '[' + schema.items.map(i => getSchemaType(i, module, {title: level ? true : false, name: name })).join(', ') + ']'
    }
    else {
      suffix = getSchemaType(schema, module, { title: level ? true : false, name: name }) // prefer schema title over robust descriptor
    }
    
    if (level === 0) {
      property = theTitle
    }

    // if there's a summary or description, append it as a comment (description only gets first line)
    if (level > 0 && (summary || schema.description)) {
      summary = `\t// ${summary || schema.description.split('\n')[0]}`
    }

    if (suffix === 'array') {
      suffix = '[]'
    }

    if (summary) {
      return '  '.repeat(level) + `${prefix}${suffix} ${property}; ${summary}`
    }
    else {
      return '  '.repeat(level) + `${prefix}${suffix} ${property};`
    }
  }

  structure = structure.join('\n').split('\n')

  if (level === 0) {
    const length = str => str.length
    let max = Math.max(...structure.map(l => l.split('\t//')[0]).map(length)) + 2
    structure = structure.map( l => l.split('\t//').join(' '.repeat(max - l.split('\t//')[0].length) + '//'))
  }
  return structure.join('\n')
}

function getSchemaShapeInfo(json, module, schemas = {}, { name = '', prefix = '', merged = false, level = 0, title, summary, descriptions = true, destination = '', section = '', enums = true } = {}) {
  let shape = ''

  if (destination && section) {
    const isHeader = (destination.includes("JsonData_") !== true) && destination.endsWith(".h")
    const isCPP = ((destination.endsWith(".cpp") || destination.includes("JsonData_")) && (section.includes('accessors') !== true))
    json = JSON.parse(JSON.stringify(json))

    name = json.title || name

    if (json['$ref']) {
      if (json['$ref'][0] === '#') {
        //Ref points to local schema
        //Get Path to ref in this module and getSchemaType
        const schema = getPath(json['$ref'], module, schemas)
        const tname = schema.title || json['$ref'].split('/').pop()
        if (json['$ref'].includes('x-schemas')) {
          schema = (getRefModule(json['$ref'].split('/')[2]))
        }

        shape = getSchemaShapeInfo(schema, module, schemas, { name, prefix, merged, level, title, summary, descriptions, destination, section, enums })
      }
    }
    //If the schema is a const,
    else if (json.hasOwnProperty('const') && !isCPP) {
      if (level > 0) {

        let t = description(capitalize(name), json.description)
        typeName = getTypeName(getModuleName(module), name, prefix)
        t += (isHeader ? getPropertyAccessors(typeName, capitalize(name), typeof schema.const, { level: level, readonly: true, optional: false }) : getPropertyAccessorsImpl(typeName, getJsonType(schema, module, { level, name }), typeof schema.const, { level: level, readonly: true, optional: false }))
        shape += '\n' + t
      }
    }
    else if (json.type === 'object') {
      if (!name) {
        console.log(`WARNING: unnamed schema in ${module.info.title}.`)
        console.dir(json)
        shape = ''
      }
      else if (json.properties && (validJsonObjectProperties(json) === true)) {
        let c_shape = description(capitalize(name), json.description)
        let cpp_shape = ''
        let tName = getTypeName(getModuleName(module), json.title || name, prefix)
        c_shape += '\n' + (isHeader ? getObjectHandleManagement(tName) : getObjectHandleManagementImpl(tName, getJsonType(json, module, { name })))
        let props = []
        let containerName = ((prefix.length > 0) && (!name.startsWith(prefix))) ? (prefix + '_' + capitalize(name)) : capitalize(name)
        Object.entries(json.properties).forEach(([pname, prop]) => {
          let items
          var desc = '\n' + description(capitalize(pname), prop.description)
          if (prop.type === 'array') {
            if (Array.isArray(prop.items)) {
              //TODO
              const IsHomogenous = arr => new Set(arr.map( item => item.type ? item.type : typeof item)).size === 1
              if (!IsHomogenous(prop.items)) {
                throw 'Heterogenous Arrays not supported yet'
              }
              items = prop.items[0]
            }
            else {
              // grab the type for the non-array schema
              items = prop.items
            }

            let info = getSchemaTypeInfo(module, items, items.name || pname, schemas, prefix, {level : level, descriptions: descriptions, title: true})
            if (info.type && info.type.length > 0) {
              let objName = tName + '_' + capitalize(prop.title || pname)
              let moduleName = info.namespace
              info.json.namespace = info.namespace
              let moduleProperty = getJsonTypeInfo(module, json, json.title || name, schemas, prefix)
              let prefixName = ((prefix.length > 0) && items['$ref']) ? '' : prefix
              let subModuleProperty = getJsonTypeInfo(module, info.json, info.name, schemas, prefix)

              let t = description(capitalize(info.name), json.description) + '\n'
              t += '\n' + (isHeader ? getArrayAccessors(objName, tName, info.type) : getArrayAccessorsImpl(tName, moduleProperty.type, (tName), subModuleProperty.type, capitalize(pname || prop.title), info.type, info.json))
              c_shape += '\n' + t
              props.push({name: `${pname}`, type: `WPEFramework::Core::JSON::ArrayType<${subModuleProperty.type}>`})
            }
            else {
              console.log(`a. WARNING: Type undetermined for ${name}:${pname}`)
            }
          } else {
            if (((merged === false) || ((merged === true) && (pname.includes(name)))) && (prop.type === 'object' || prop.anyOf || prop.allOf)) {
              shape += getSchemaShapeInfo(prop, module, schemas, { name : pname, prefix, merged: false, level: 1, title, summary, descriptions, destination, section, enums })
            }
            let info = getSchemaTypeInfo(module, prop, pname, module['x-schemas'], prefix, {descriptions: descriptions, level: level + 1, title: true})
            if (info.type && info.type.length > 0) {
              let subPropertyName = ((pname.length !== 0) ? capitalize(pname) : info.name)
              let moduleProperty = getJsonTypeInfo(module, json, name, schemas, prefix)
              let subProperty = getJsonTypeInfo(module, prop, pname, schemas, prefix)
              c_shape += '\n' + description(capitalize(pname), info.json.description)
              c_shape += '\n' + (isHeader ? getPropertyAccessors(tName, capitalize(pname), info.type, { level: 0, readonly: false, optional: isOptional(pname, json) }) : getPropertyAccessorsImpl(tName, moduleProperty.type, subProperty.type, subPropertyName, info.type, info.json, {readonly:false, optional:isOptional(pname, json)}))
              let property = getJsonType(prop, module, { name : pname, prefix })
              props.push({name: `${pname}`, type: `${property}`})
            }
            else {
              console.log(`b. WARNING: Type undetermined for ${name}:${pname}`)
            }
          }
        })

        cpp_shape += getJsonContainerDefinition(json, containerName, props)

        if (isCPP) {
          shape += '\n' + cpp_shape
        }
        else {
          shape += '\n' + c_shape
        }
      }
      else if (json.propertyNames && json.propertyNames.enum) {
        //propertyNames in object not handled yet
      }
      else if (json.additionalProperties && (typeof json.additionalProperties === 'object') && (validJsonObjectProperties(json) === true) && !isCPP) {
        let info = getSchemaTypeInfo(module, json.additionalProperties, name, module['x-schemas'], prefix)
        if (!info.type || (info.type.length === 0)) {
          info.type = 'char*'
          info.json = json.additionalProperties
          info.json.type = 'string'
        }

        let tName = getTypeName(getModuleName(module), json.title || name, prefix)
        let t = description(capitalize(name), json.description) + '\n'
        let containerType = 'WPEFramework::Core::JSON::VariantContainer'

        let subModuleProperty = getJsonTypeInfo(module, info.json, info.name, module['x-schemas'])
        if (isCPP && ((info.json.type === 'object' && info.json.properties) || info.json.type === 'array')) {
          // Handle Container generation here
        }

        t += '\n' + (isHeader ? getObjectHandleManagement(tName) : getObjectHandleManagementImpl(tName, containerType))
        t += (isHeader ? getMapAccessors(tName, info.type, { descriptions: descriptions, level: level }) : getMapAccessorsImpl(tName, containerType, subModuleProperty.type, info.type, info.json, { readonly: true, optional: false }))
        shape += '\n' + t
      }
      else if (json.patternProperties) {
        console.log(`WARNING: patternProperties are not supported by Firebolt(inside getModuleName(module):${name})`)
      }
    }
    else if (json.anyOf) {
      if (level > 0) {
        let mergedSchema = getMergedSchema(module, json, name, schemas)
        let prefixName = ((prefix.length > 0) && (!name.startsWith(prefix))) ? prefix : capitalize(name)
        shape += getSchemaShapeInfo(mergedSchema, module, schemas, { name, prefix: prefixName, merged, level, title, summary, descriptions, destination, section, enums })
      }
    }
    else if (json.oneOf) {
      //Just ignore schema shape, since this has to be treated as string
    }
    else if (json.allOf) {
      let title = (json.title ? json.title : name)
      let union = deepMergeAll(module, title, json, schemas)
      union.title = title

      delete union['$ref']

      return getSchemaShapeInfo(union, module, schemas, { name, prefix, merged: true, level, title, summary, descriptions, destination, section, enums })
    }
    else if (json.type === 'array') {
      let j
      if (Array.isArray(json.items)) {
        //TODO
        const IsHomogenous = arr => new Set(arr.map( item => item.type ? item.type : typeof item)).size === 1
        if (!IsHomogenous(json.items)) {
          throw 'Heterogenous Arrays not supported yet'
        }
        j = json.items[0]
      }
      else {
        j = json.items
      }
      shape += getSchemaShapeInfo(j, module, schemas, { name: j.title || name, prefix, merged, level, title, summary, descriptions, destination, section, enums })

      if (!isCPP) {
        let info = getSchemaTypeInfo(module, j, j.title || name, schemas, prefix, {level : level, descriptions: descriptions, title: true})

        if (info.type && info.type.length > 0) {
          let type = getArrayElementSchema(json, module, schemas, info.name)
          let arrayName = capitalize(name) + capitalize(type.type)
          let objName = getTypeName(info.namespace, arrayName, prefix)
          let tName = objName + 'Array'
          let moduleName = info.namespace
          info.json.namespace = info.namespace
          let moduleProperty = getJsonTypeInfo(module, json, json.title || name, schemas, prefix)
          let subModuleProperty = getJsonTypeInfo(module, j, j.title, schemas, prefix)
          let t = ''
          if (level === 0) {
            t += description(capitalize(info.name), json.description) + '\n'
            t += '\n' + (isHeader ? getObjectHandleManagement(tName) : getObjectHandleManagementImpl(tName, moduleProperty.type))
          }
          t += '\n' + (isHeader ? getArrayAccessors(objName, tName, info.type) : getArrayAccessorsImpl(objName, moduleProperty.type, (tName), subModuleProperty.type, '', info.type, info.json))
          shape += '\n' + t
        }
      }
    }
    else {
      shape += '\n' + getSchemaType(module, json, name, schemas, prefix, {level: level, descriptions: descriptions})
    }
  }

  return shape
}

const getJsonNativeType = json => {
  let type
  let jsonType = json.const ? typeof json.const : json.type

  if (jsonType === 'string') {
    type = getSdkNameSpace() + '::JSON::String'
  }
  else if (jsonType === 'number') {
    type = 'WPEFramework::Core::JSON::Float'
  }
  else if (json.type === 'integer') {
    type = 'WPEFramework::Core::JSON::DecSInt32'
  }
  else if (jsonType === 'boolean') {
    type = 'WPEFramework::Core::JSON::Boolean'
  }
  else if (jsonType === 'null') {
    type = 'void'
  }
  else {
    throw 'Unknown JSON Native Type !!!'
  }
  return type
}

function getJsonType(schema = {}, module = {}, { name = '', prefix = '', descriptions = false, level = 0 } = {}) {
  let info = getJsonTypeInfo(module, schema, name, module['x-schemas'], prefix, { descriptions: descriptions, level: level })
  return info.type
}

function getJsonTypeInfo(module = {}, json = {}, name = '', schemas, prefix = '', {descriptions = false, level = 0} = {}) {

  if (json.schema) {
    json = json.schema
  }

  let structure = {}
  structure["deps"] = new Set() //To avoid duplication of local ref definitions
  structure["type"] = []

  if (json['$ref']) {
    if (json['$ref'][0] === '#') {
      //Ref points to local schema
      //Get Path to ref in this module and getSchemaTypef
      let definition = getPath(json['$ref'], module, schemas)
      let tName = definition.title || json['$ref'].split('/').pop()

      let schema = module
      if (json['$ref'].includes('x-schemas')) {
        schema = (getRefModule(json['$ref'].split('/')[2]))
      }

      const res = getJsonTypeInfo(schema, definition, tName, schemas, '', {descriptions, level})
      structure.deps = res.deps
      structure.type = res.type
      return structure
    }
  }
  else if (json.const) {
    structure.type = getJsonNativeType(json)
    return structure
  }
  else if (json['x-method']) {
    return structure
    //throw "x-methods not supported yet"
  }
  else if (json.additionalProperties && (typeof json.additionalProperties === 'object')) {
      //This is a map of string to type in schema
      //Get the Type
      let type = getJsonTypeInfo(module, json.additionalProperties, name, schemas, prefix)
      if (type.type && type.type.length > 0) {
          structure.type = 'WPEFramework::Core::JSON::VariantContainer';
          return structure
      }
      else {
        console.log(`WARNING: Type undetermined for ${name}`)
      }
    }
  else if (json.type === 'string' && json.enum) {
    //Enum
    let t = 'WPEFramework::Core::JSON::EnumType<' + (json.namespace ? json.namespace : getModuleName(module)) + '_' + (getEnumName(name, prefix)) + '>'
    structure.type.push(t)
    return structure
  }
  else if (Array.isArray(json.type)) {
    let type = json.type.find(t => t !== 'null')
    let sch = JSON.parse(JSON.stringify(json))
    sch.type = type
    return getJsonTypeInfo(module, sch, name, schemas, prefix )
  }
  else if (json.type === 'array' && json.items) {
    let res
    let items
    if (Array.isArray(json.items)) {
      //TODO
      const IsHomogenous = arr => new Set(arr.map( item => item.type ? item.type : typeof item)).size === 1
      if (!IsHomogenous(json.items)) {
        throw 'Heterogenous Arrays not supported yet'
      }
      items = json.items[0]
    }
    else {
      items = json.items
      // grab the type for the non-array schema
    }
    res = getJsonTypeInfo(module, items, items.name || name, schemas, prefix)
    structure.deps = res.deps
    structure.type.push(`WPEFramework::Core::JSON::ArrayType<${res.type}>`)

    return structure
  }
  else if (json.allOf) {
    let title = json.title ? json.title : name
    let union = deepMergeAll(module, title, json, schemas)
    union['title'] = title

    delete union['$ref']
    return getJsonTypeInfo(module, union, '', schemas, '', {descriptions, level})
  }
  else if (json.oneOf) {
    structure.type = getJsonNativeTypeForOpaqueString()
    return structure
  }
  else if (json.patternProperties) {
    structure.type = getJsonNativeTypeForOpaqueString()
    return structure
  }
  else if (json.anyOf) {
    let mergedSchema = getMergedSchema(module, json, name, schemas)
    let prefixName = ((prefix.length > 0) && (!name.startsWith(prefix))) ? prefix : capitalize(name)
    structure = getJsonTypeInfo(module, mergedSchema, name, schemas, prefixName, {descriptions, level})
  }
  else if (json.type === 'object') {
    if (hasProperties(json) !== true) {
      structure.type = getJsonNativeTypeForOpaqueString()
    }
    else {
      let schema = getSchemaTypeInfo(module, json, name, module['x-schemas'], prefix)
      if (schema.namespace && schema.namespace.length > 0) {
        structure.type.push(getJsonDataStructName(schema.namespace, json.title || name, prefix))
      }
    }
    return structure
  }
  else if (json.type) {
    structure.type = getJsonNativeType(json)
    return structure
  }
  return structure
}

function getTypeScriptType(jsonType) {
  if (jsonType === 'integer') {
    return 'number'
  }
  else {
    return jsonType
  }
}

const enumReducer = (acc, val, i, arr) => {
  const keyName = val.split(':').pop().replace(/[\.\-]/g, '_').replace(/\+/g, '_plus').replace(/([a-z])([A-Z0-9])/g, '$1_$2').toUpperCase()
  acc = acc + `    ${keyName} = '${val}'`
  if (i < arr.length - 1) {
    acc = acc.concat(',\n')
  }
  return acc
}

function getSchemaInstantiation(schema, module, name, { instantiationType = '' } = {}) {

  if (instantiationType === 'params') {
    return getParameterInstantiation(getParamList(schema, module))
  }
  else if (instantiationType === 'result') {
    let resultType = getSchemaType(schema, module, { title: true, name: name, resultSchema: true}) || ''
    let resultJsonType = getJsonType(schema, module, {name: name}) || ''
    return getResultInstantiation(name, resultType, resultJsonType)
  }
  else if (instantiationType === 'callback.params') {
    let resultJsonType = getJsonType(schema.result.schema, module, {name: schema.result.name}) || ''
    return getCallbackParametersInstantiation(getParamList(schema, module), resultJsonType)
  }
  else if (instantiationType === 'callback.result') {
    let resultType = getSchemaType(schema.result.schema, module, { title: true, name: schema.result.name, resultSchema: true}) || ''
    let resultJsonType = getJsonType(schema.result.schema, module, {name: schema.result.name}) || ''
    return getCallbackResultInstantiation(resultType, resultJsonType)
  }
  else if (instantiationType === 'callback.response') {
    let resultType = getSchemaType(schema.result.schema, module, { title: true, name: schema.result.name, resultSchema: true}) || ''
    let resultJsonType = getJsonType(schema.result.schema, module, {name: schema.result.name}) || ''
    return getCallbackResponseInstantiation(getParamList(schema, module), resultType, resultJsonType)
  }

  return ''
}

export default {
    getMethodSignature,
    getMethodSignatureParams,
    getSchemaShape,
    getSchemaType,
    getJsonType,
    getSchemaInstantiation
}
