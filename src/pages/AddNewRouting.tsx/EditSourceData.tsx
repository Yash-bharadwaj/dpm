/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Button,
  Col,
  Form,
  Modal,
  Offcanvas,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import { QuestionCircle } from "react-bootstrap-icons";

import regions from "../../data/regions.json";
import sources from "../../data/sources.json";
import source_logtypes from "../../data/source_logtypes.json"

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import {
  checkAccessAuthFields,
  checkAssumeAuthFieldsOne,
  checkAssumeAuthFieldsTwo,
  checkValueWithRegex,
} from "./helper";

import toast, { toastConfig } from "react-simple-toasts";
import "react-simple-toasts/dist/theme/dark.css";

import "react-simple-toasts/dist/theme/failure.css";
import "react-simple-toasts/dist/theme/success.css";
import { useParams } from "react-router-dom";

toastConfig({ theme: "dark" });

const EditSourceData = ({
  show,
  onClose,
  selectedSource,
  onSaveSettings,
  selectedNode,
  addedNodes,
}: any) => {
  const params = useParams();
  const orgCode = params.orgcode;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [selectedTab, setSelectedTab] = useState("setting");
  const [authIndex, setAuthIndex] = useState(null);
  const [topics, setTopics] = useState([""]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sourceTypes, setSourceTypes] = useState([]);
  const [sourceName, setSourceName] = useState("");
  const [showSourceFields, setShowSourceFields] = useState(false);
  

  let sourceInitialValues = {};
  let mandatoryFields = [];
  selectedSource.settings.forEach((setting: any) => {
    if (setting.datatype === "boolean") {
      // Your boolean handling code
    } else {
      if (selectedNode !== undefined && selectedNode?.data.nodeData) {
        if (setting.name === "address" || setting.name === "port") {
          // Handle address and port fields
          if (selectedNode?.data.nodeData?.address) {
            const addressParts = selectedNode.data.nodeData.address.split(":");
            if (setting.name === "address") {
              sourceInitialValues["address"] = addressParts[0];
            }
            if (setting.name === "port") {
              sourceInitialValues["port"] = addressParts[1];
            }
          } else {
            sourceInitialValues[setting.name] = setting.default || "";
          }
        } else if (setting.name === "queue_url") {
          // Queue URL handling
        } else if (setting.name === "topics") {
          // Topics handling
        } else if (setting.name === "keepalive") {
          const keepaliveValue = selectedNode?.data.nodeData[setting.name];
          
          // Handle the keepalive object case
          if (keepaliveValue && typeof keepaliveValue === 'object' && keepaliveValue.time_secs !== undefined) {
            sourceInitialValues[setting.name] = keepaliveValue.time_secs;
          } 
          // Handle the number case
          else if (keepaliveValue !== undefined && keepaliveValue !== "") {
            sourceInitialValues[setting.name] = keepaliveValue;
          } 
          // Default value
          else {
            sourceInitialValues[setting.name] = 60; // Default value
          }
        }
        else {
          // Your default field handling
          sourceInitialValues[setting.name] =
            selectedNode?.data.nodeData[setting.name] || setting.default || "";
        }
      } else {
        // Your code for new nodes
        sourceInitialValues[setting.name] =
          selectedNode?.data.nodeData[setting.name] || setting.default || "";
      }
    }
  
    if (setting.mandatory) {
      mandatoryFields.push(setting.name);
    }
  });

  selectedSource.advanced?.forEach((advanced: any) => {

    if (advanced.name === "keepalive" && advanced.fields) {
      let keepaliveValue = 60; // Default value
      if (
        selectedNode?.data.nodeData[advanced.name] &&
        typeof selectedNode?.data.nodeData[advanced.name] === "object" &&
        selectedNode?.data.nodeData[advanced.name].time_secs !== undefined
      ) {
        keepaliveValue = selectedNode.data.nodeData[advanced.name].time_secs;
      } else if (
        selectedNode?.data.nodeData[advanced.name] &&
        !isNaN(Number(selectedNode?.data.nodeData[advanced.name]))
      ) {
        keepaliveValue = Number(selectedNode.data.nodeData[advanced.name]);
      }
      sourceInitialValues[advanced.name] = keepaliveValue;
      return; // Skip the rest of the loop for keepalive
    }

    if (advanced.datatype === "boolean") {
      if (advanced.name === "tls") {
        sourceInitialValues[advanced.name] =
          selectedNode !== undefined &&
          selectedNode?.data.nodeData["tls"].enabled !== ""
            ? selectedNode?.data.nodeData["tls"].enabled === false
              ? false
              : true
            : advanced.default || false;
      } else {
        sourceInitialValues[advanced.name] =
          selectedNode?.data.nodeData[advanced.name] !== ""
            ? selectedNode?.data.nodeData[advanced.name] === false
              ? false
              : true
            : advanced.default || "";
      }
    } else {
      if (advanced.name === "codec") {
        sourceInitialValues[advanced.name] =
          selectedNode?.data.nodeData["decoding"].codec ||
          advanced.default ||
          "";
      } else if (
        advanced.name === "permit_origin" &&
        selectedNode !== undefined &&
        selectedNode?.data.nodeData["permit_origin"] !== ""
      ) {
        const values = selectedNode?.data.nodeData["permit_origin"];
        let permitValues = "";

        if (values && values.length !== 0) {
          values.forEach((value: any, index: number) => {
            if (index === 0) {
              permitValues = value;
            } else {
              permitValues = permitValues + "," + value;
            }
          });
        }

        sourceInitialValues["permit_origin"] = permitValues;
      } else {
        sourceInitialValues[advanced.name] =
          selectedNode?.data.nodeData[advanced.name] || advanced.default || "";
      }
    }

    if (advanced.mandatory) {
      mandatoryFields.push(advanced.name);
    }
  });

  if (selectedSource.authentication) {
    if (selectedSource.authentication.dropdownOptions) {
      selectedSource.authentication.dropdownOptions.forEach((option: any) => {
        option.fieldsToShow.forEach((fields: any) => {
          let authType = "auth";
          if (selectedNode?.data.nodeData.type === "kafka") {
            authType = "sasl";
          }

          if (fields.datatype === "boolean") {
            sourceInitialValues[fields.name] =
              selectedNode?.data.nodeData[authType][fields.name] !== ""
                ? selectedNode?.data.nodeData[authType][fields.name] === false
                  ? false
                  : true
                : fields.default || "";
          } else {
            if (fields.name === "auth_region") {
              sourceInitialValues[fields.name] =
                selectedNode?.data.nodeData.auth["region"] ||
                fields.default ||
                "";
            } else {
              sourceInitialValues[fields.name] =
                selectedNode?.data.nodeData.auth[fields.name] ||
                fields.default ||
                "";
            }
          }

          if (fields.mandatory) {
            mandatoryFields.push(fields.name);
          }
        });
      });
    } else {
      selectedSource.authentication.fields.forEach((field: any) => {
        let authType = "auth";
        if (selectedNode?.data.nodeData.type === "kafka") {
          authType = "sasl";
        }

        if (
          field.datatype === "boolean" &&
          selectedNode?.data.nodeData[authType]
        ) {
          sourceInitialValues[field.name] =
            selectedNode?.data.nodeData[authType][field.name] !== "" &&
            selectedNode?.data.nodeData[authType][field.name] !== undefined
              ? selectedNode?.data.nodeData[authType][field.name] === false
                ? false
                : true
              : field.default || false;
        } else {
          if (selectedNode?.data.nodeData[authType]) {
            sourceInitialValues[field.name] =
              selectedNode?.data.nodeData[authType][field.name] ||
              field.default ||
              "";
          } else {
            sourceInitialValues[field.name] = field.default || "";
          }
        }

        if (field.mandatory) {
          mandatoryFields.push(field.name);
        }
      });
    }

    if (
      selectedNode !== undefined &&
      authIndex === null &&
      (selectedNode.data.nodeData.type === "aws_s3" ||
        selectedNode.data.nodeData.type === "aws_sqs")
    ) {
      if (sourceInitialValues["access_key_id"] !== "") {
        setAuthIndex("0");

        const fieldIndex = mandatoryFields.findIndex(checkAccessAuthFields);
        mandatoryFields.splice(fieldIndex, 1);
      }
      if (sourceInitialValues["assume_role"] !== "") {
        setAuthIndex("1");

        const indexOne = mandatoryFields.findIndex(checkAssumeAuthFieldsOne);
        mandatoryFields.splice(indexOne, 1);

        const indexTwo = mandatoryFields.findIndex(checkAssumeAuthFieldsTwo);
        mandatoryFields.splice(indexTwo, 1);
      }
    }
  }


  sources.fields.forEach((field: any) => {
    if (field.label === "organization.id") {
      sourceInitialValues.organization = {
        id: selectedNode?.data.nodeData[field.name] || selectedSource[field.label] || orgCode,
      };
    } 
    // Handle log fields
    else if (field.label === "log.source_type") {
      sourceInitialValues["log.source_type"] = selectedNode?.data.nodeData?.log?.source_type || "";
    }
    else if (field.label === "log.source_name") {
      sourceInitialValues["log.source_name"] = selectedNode?.data.nodeData?.log?.source_name || "";
    }
    else if (field.label === "log.schema") {
      sourceInitialValues["log.schema"] = selectedNode?.data.nodeData?.log?.schema || "raw";
    }
    else if (field.label === "log.format") {
      sourceInitialValues["log.format"] = selectedNode?.data.nodeData?.log?.format || "json";
    }
    else {
      sourceInitialValues[field.label] = selectedNode?.data.nodeData[field.name] || selectedSource[field.label] || "";
    }
  
    if (field.mandatory) {
      mandatoryFields.push(field.label);
    }
  });

  const [checkMandatoryFields, setMandatoryFields] = useState(mandatoryFields);

  const validateForm = async (values: any) => {
    return checkFormValid(values);
  };

  const checkFormValid = (values: any) => {
    let error = false;

    checkMandatoryFields.forEach((field) => {
      if (values[field] === "") {
        if (field === "topics") {
          if (topics[0] === "") {
            error = true;
          }
        } else {
          error = true;
        }
      }
    });

    return error;
  };

  const formik = useFormik({
    initialValues: sourceInitialValues,
    onSubmit: (values) => {
      console.log(JSON.stringify(values, null, 2));
    },

    validate: validateForm,
    validateOnBlur: true,
    validateOnChange: true,
  });

  // Add this useEffect to handle clicking outside the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      const dropdown = document.querySelector('.dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


// 1. Initialize sourceTypes (keep this first)
// 1. Initialize sourceTypes (keep this first)
useEffect(() => {
  const types = Object.entries(source_logtypes).map(([key, value]) => ({
    value: key,
    label: `${key} (${value.name})`
  }));
  setSourceTypes(types);
}, []);

// Handle search input changes
useEffect(() => {
  if (searchInput === '') {
    // If input is cleared, reset the form value
    formik.setFieldValue("log.source_type", "", false);
    
    // Reset the dropdown to show all options
    const allTypes = Object.entries(source_logtypes).map(([key, value]) => ({
      value: key,
      label: `${key} (${value.name})`
    }));
    setSourceTypes(allTypes);
  } else {
    // Filter source types based on search input
    const filteredTypes = Object.entries(source_logtypes)
      .map(([key, value]) => ({
        value: key,
        label: `${key} (${value.name})`
      }))
      .filter(type => 
        type.label.toLowerCase().includes(searchInput.toLowerCase())
      );
    
    setSourceTypes(filteredTypes);
    
    // Check if the search input exactly matches a type label
    const matchingType = filteredTypes.find(type => type.label === searchInput);
    if (matchingType) {
      formik.setFieldValue("log.source_type", matchingType.value, false);
    }
  }
}, [searchInput]);

// Sync the form value with the displayed search input
// Handle showSourceFields toggle
useEffect(() => {
  if (!showSourceFields) {
    // Store current values before clearing
    const currentSourceType = formik.values["log.source_type"];
    const currentSourceName = formik.values["log.source_name"];
    
    // Clear values when toggle is off
    formik.setFieldValue("log.source_type", "", false);
    formik.setFieldValue("log.source_name", "", false);
    setSearchInput('');
    
    // Store in state for potential restoration
    setSourceName(currentSourceName || "");
  } else {
    // When toggle is turned on, only set default values if they don't already exist
    if (!formik.values["log.schema"]) {
      formik.setFieldValue("log.schema", "raw", false);
    }
    if (!formik.values["log.format"]) {
      formik.setFieldValue("log.format", "json", false);
    }
  }
}, [showSourceFields]);


// 2. Handle initial node data loading and showSourceFields state
// Handle initial node data loading and showSourceFields state
useEffect(() => {
  if (selectedNode?.data.nodeData?.log) {
    const hasSourceInfo = !!(
      selectedNode.data.nodeData.log.source_type || 
      selectedNode.data.nodeData.log.source_name
    );
    setShowSourceFields(hasSourceInfo);

    // Set initial values from node data
    const { source_type, source_name, schema, format } = selectedNode.data.nodeData.log;
    
    // Only set if values exist in node data
    if (source_type) {
      formik.setFieldValue("log.source_type", source_type, false);
      
      // Find and set the corresponding display label
      const sourceTypeObj = Object.entries(source_logtypes).find(
        ([key]) => key === source_type
      );
      
      if (sourceTypeObj) {
        const label = `${sourceTypeObj[0]} (${sourceTypeObj[1].name})`;
        setSearchInput(label);
      }
    }
    
    if (source_name) formik.setFieldValue("log.source_name", source_name, false);
    if (schema) formik.setFieldValue("log.schema", schema, false);
    if (format) formik.setFieldValue("log.format", format, false);
  }
}, [selectedNode]);

// 3. Handle showSourceFields toggle
useEffect(() => {
  if (!showSourceFields) {
    // Store current values before clearing
    const currentValues = {
      sourceType: formik.values["log.source_type"],
      sourceName: formik.values["log.source_name"]
    };

    // Clear values when toggle is off
    formik.setFieldValue("log.source_type", "", false);
    formik.setFieldValue("log.source_name", "", false);

    // Store in component state for potential restoration
    setSourceName(currentValues.sourceName || "");
  } else {
    // When toggle is turned on, only set default values if they don't already exist
    if (!formik.values["log.schema"]) {
      formik.setFieldValue("log.schema", "raw", false);
    }
    if (!formik.values["log.format"]) {
      formik.setFieldValue("log.format", "json", false);
    }
  }
}, [showSourceFields]);

// 4. Handle form value persistence
useEffect(() => {
  const currentFormValues = formik.values;
  
  // Ensure default values are set only if they're empty
  if (!currentFormValues["log.schema"]) {
    formik.setFieldValue("log.schema", "raw", false);
  }
  if (!currentFormValues["log.format"]) {
    formik.setFieldValue("log.format", "json", false);
  }

  // If we have source fields and toggle is on, ensure they're set
  if (showSourceFields) {
    if (currentFormValues["log.source_type"]) {
      formik.setFieldValue("log.source_type", currentFormValues["log.source_type"], false);
    }
    if (currentFormValues["log.source_name"]) {
      formik.setFieldValue("log.source_name", currentFormValues["log.source_name"], false);
    }
  }
}, [formik.values["log.source_type"], formik.values["log.source_name"]]);


  const onTabSelect = (tab: string) => {
    setSelectedTab(tab);
  };

  const onCheck = (index: number) => {
    setAuthIndex(index);

    selectedSource.authentication.dropdownOptions[index].fieldsToShow.forEach(
      (field: object) => {
        formik.setFieldValue(field?.name, "");
      }
    );

    let prevValues = mandatoryFields;

    if (index === "0") {
      const fieldIndex = prevValues.findIndex(checkAccessAuthFields);

      prevValues.splice(fieldIndex, 1);
    } else {
      const indexOne = prevValues.findIndex(checkAssumeAuthFieldsOne);
      prevValues.splice(indexOne, 1);

      const indexTwo = prevValues.findIndex(checkAssumeAuthFieldsTwo);
      prevValues.splice(indexTwo, 1);
    }

    setMandatoryFields((prevList) => [...prevValues]);
  };

  const onNextClick = () => {
    if (selectedTab === "setting") {
      if (selectedSource.authentication) {
        setSelectedTab("auth");
      } else if (selectedSource.advanced) {
        setSelectedTab("advanced");
      } else {
        setSelectedTab("fields");
      }
    }

    if (selectedTab === "auth") {
      if (selectedSource.advanced) {
        setSelectedTab("advanced");
      } else {
        setSelectedTab("fields");
      }
    }

    if (selectedTab === "advanced") {
      setSelectedTab("fields");
    }

    if (selectedTab === "fields") {
      saveSettings();
    }
  };

  const saveSettings = () => {
    const sourceValues = {};
    let portAvailable = true;
    let nameAvailable = true;
  
    if (addedNodes.length !== 0) {
      const portNumber = formik.values["port"];
      const name = formik.values["name"];
      const mode = selectedSource.mode || "tcp";
  
      addedNodes.forEach((node: any) => {
        const sourceMode = node.data.nodeData.mode || "tcp";
        if (
          node.data.type === "source" &&
          selectedNode?.id !== node.id &&
          node.data.nodeData.address
        ) {
          const existingPort = node.data.nodeData.address.split(":");
          if (
            parseInt(existingPort[1]) === parseInt(portNumber) &&
            mode === sourceMode
          ) {
            portAvailable = false;
          }
        }
  
        const enteredName = name.replaceAll(" ", "_");
        const inputName = selectedNode ? enteredName : "input_" + enteredName;
  
        if (
          node.data.nodeData.name === inputName &&
          selectedNode?.id !== node.id
        ) {
          nameAvailable = false;
        }
      });
    }
  
    if (!portAvailable) {
      toast(
        "Entered port is already used in configuration, please choose a different port",
        {
          position: "top-right",
          zIndex: 9999,
          theme: "failure",
        }
      );
    } else if (!nameAvailable) {
      toast(
        "Source name is already used in configuration, please enter a different name.",
        {
          position: "top-right",
          zIndex: 9999,
          theme: "failure",
        }
      );
    } else {
      const keys = Object.keys(formik.values);
  
      keys.forEach((item) => {
        // Ignore log-related field names when they appear as individual fields
        if (
          item === "log.source_name" ||
          item === "log.source_type" ||
          item === "log.schema" ||
          item === "log.format"
        ) {
          return; // Skip these individual fields as they'll be handled in the log object
        }
      
        if (
          formik.values[item] !== "" ||
          item === "tls" ||
          item === "enabled"
        ) {
          if (item === "name") {
            const name = formik.values.name.replaceAll(" ", "_");
            if (selectedNode === undefined) {
              sourceValues.name = "input_" + name;
            } else {
              sourceValues.name = name;
            }
          } else if (item === "address") {
            sourceValues["address"] =
              formik.values["address"] + ":" + formik.values["port"].toString();
          } else if (item === "organization") {
            if (formik.values["organization"].id !== "") {
              sourceValues["organization"] = formik.values["organization"];
            }
          } else if (item.startsWith("log.")) {
            if (!sourceValues.log) {
              sourceValues.log = {
                schema: formik.values["log.schema"] || "raw",
                format: formik.values["log.format"] || "json"
              };
            }
            
            if (showSourceFields) {
              if (formik.values["log.source_type"]) {
                sourceValues.log.source_type = formik.values["log.source_type"];
              }
              if (formik.values["log.source_name"]) {
                sourceValues.log.source_name = formik.values["log.source_name"];
              }
            }
           else {
              // If toggle is off, explicitly remove these fields if they exist
              delete sourceValues.log.source_type;
              delete sourceValues.log.source_name;
            }
          }
          else if (item === "log") {
            // Handle all log-related fields here
            let schema = formik.values.log ? formik.values.log.schema : formik.values["log.schema"];
            let format = formik.values.log ? formik.values.log.format : formik.values["log.format"];
            let sourceType = formik.values.log ? formik.values.log.source_type : formik.values["log.source_type"];
            let sourceName = formik.values.log ? formik.values.log.source_name : formik.values["log.source_name"];
            
            sourceValues.log = {
              schema: schema || "raw",
              format: format || "json",
              ...(showSourceFields && sourceType && { source_type: sourceType }),
              ...(showSourceFields && sourceName && { source_name: sourceName })
            };
          }
          else if (item === "tls" || item === "codec") {
            if (item === "tls") {
              sourceValues["tls"] = {
                enabled:
                  formik.values["tls"] === "true" ||
                  formik.values["tls"] === true
                    ? true
                    : false,
              };
            } else {
              sourceValues["decoding"] = {
                codec: formik.values["codec"],
              };
            }
          } else if (item === "permit_origin") {
            const formValue = formik.values["permit_origin"];
            const value = formValue.split(",");
            sourceValues[item] = value;
          } 


          // --- Handle keepalive as an object with time_secs ---
          else if (item === "keepalive" && selectedSource.advanced?.some((adv: any) => adv.name === "keepalive" && adv.fields)) {
            let keepaliveVal = formik.values["keepalive"];
            if (keepaliveVal === undefined || keepaliveVal === "") {
              sourceValues["keepalive"] = { time_secs: 60 }; // Default value
            } else {
              sourceValues["keepalive"] = { time_secs: Number(keepaliveVal) };
            }
          }
          else {
            if (authIndex) {
              sourceValues["auth"] = {};
  
              selectedSource.authentication.dropdownOptions[
                authIndex
              ].fieldsToShow.map((field: string) => {
                if (field.name === "auth_region") {
                  if (formik.values["auth_region"] !== "") {
                    sourceValues.auth["region"] = formik.values[field.name];
                  }
                } else {
                  sourceValues.auth[field.name] = formik.values[field.name];
                }
              });
            }
  
            if (formik.values.enabled) {
              sourceValues["sasl"] = {
                enabled: formik.values.enabled,
              };
  
              selectedSource.authentication.fields.map((field: string) => {
                if (field.name === "enabled") {
                  sourceValues.sasl.enabled = true;
                } else {
                  if (formik.values[field.name] !== "") {
                    sourceValues.sasl[field.name] = formik.values[field.name];
                  }
                }
              });
            }
  
            if (
              (sourceValues.auth && sourceValues.auth[item] === undefined) ||
              (sourceValues.sasl && sourceValues.sasl[item] === undefined)
            ) {
              if (
                item !== "enabled" &&
                item !== "access_key_id" &&
                item !== "secret_access_key" &&
                item !== "assume_role" &&
                item !== "mechanism" &&
                item !== "username" &&
                item !== "password" &&
                item !== "auth_region" &&
                item !== "port"
              ) {
                if (formik.values[item] !== "") {
                  if (
                    item === "queue_url" &&
                    selectedSource.type === "aws_s3"
                  ) {
                    sourceValues["sqs"] = {
                      queue_url: formik.values["queue_url"],
                    };
                  } else sourceValues[item] = formik.values[item];
                }
              }
            } else {
              if (
                item !== "enabled" &&
                item !== "access_key_id" &&
                item !== "secret_access_key" &&
                item !== "assume_role" &&
                item !== "mechanism" &&
                item !== "username" &&
                item !== "password" &&
                item !== "auth_region" &&
                item !== "port"
              ) {
                if (formik.values[item] !== "") {
                  if (
                    item === "queue_url" &&
                    selectedSource.type === "aws_s3"
                  ) {
                    sourceValues["sqs"] = {
                      queue_url: formik.values["queue_url"],
                    };
                  } else sourceValues[item] = formik.values[item];
                }
              }
            }
          }
        }
  
        if (item === "topics") {
          let addedTopics = [];
  
          if (topics[0] !== "") {
            topics.map((topic) => addedTopics.push(topic));
          }
  
          sourceValues["topics"] = addedTopics;
        }
      });
  
      sourceValues["type"] = selectedSource.type;
      sourceValues["uuid"] = selectedSource.uuid;
  
      if (selectedSource.mode) {
        sourceValues["mode"] = selectedSource.mode;
      }
  
      console.log("values", sourceValues);
  
      onSaveSettings(sourceValues);
    }
  };
  const onBackClick = () => {
    if (selectedTab === "setting") {
      onClose();
    } else if (selectedTab === "auth") {
      setSelectedTab("setting");
    } else if (selectedTab === "advanced") {
      if (selectedSource.authentication) {
        setSelectedTab("auth");
      } else {
        setSelectedTab("setting");
      }
    } else if (selectedTab === "fields") {
      if (selectedSource.advanced) {
        setSelectedTab("advanced");
      } else if (selectedSource.authentication) {
        setSelectedTab("auth");
      } else {
        setSelectedTab("setting");
      }
    }
  };

  const invalidCheck = (setting: object) => {
    let invalid = false;
    const value = formik.values[setting.name];

    if (value !== "") {
      if (
        setting.datatype === "ipaddress" ||
        setting.datatype === "ipcidr" ||
        setting.datatype === "alphanumeric" ||
        setting.datatype === "url" ||
        setting.datatype === "cs-hostport" ||
        setting.datatype === "arn" ||
        setting.datatype === "alphanumericSpecial" ||
        setting.datatype === "password"
      ) {
        const check = checkValueWithRegex(value, setting.datatype);

        if (check) {
          if (
            setting.name === "access_key_id" ||
            setting.name === "secret_access_key"
          ) {
            const lengthCheck = setting.name === "access_key_id" ? 20 : 40;
            if (value.length < lengthCheck) {
              invalid = true;
            } else {
              invalid = false;
            }
          } else {
            invalid = !check;
          }
        } else {
          invalid = !check;
        }
      } else {
        if (setting.name === "port") {
          if (value > 65535) {
            invalid = true;
          }
        } else {
          invalid = false;
        }
      }
    }

    return invalid;
  };

  const checkNonEmptyValues = (value: string, datatype: string) => {
    let invalid = true;

    if (
      datatype === "ipaddress" ||
      datatype === "ipcidr" ||
      datatype === "alphanumeric" ||
      datatype === "url" ||
      datatype === "cs-hostport" ||
      datatype === "arn" ||
      datatype === "alphanumericSpecial" ||
      datatype === "password"
    ) {
      const check = checkValueWithRegex(value, datatype);
      if (check) {
        invalid = false;
      }
    } else {
      invalid = false;
    }

    return invalid;
  };

  const checkTabValues = (tabValue: string) => {
    const { values } = formik;
    let tabInvalid = false;

    if (selectedTab === "setting" || tabValue === "all") {
      selectedSource.settings.forEach((setting: object) => {
        Object.keys(values).forEach((value: string) => {
          if (
            !setting.options &&
            setting.name === value &&
            values[value] !== "" &&
            setting.datatype !== "integer"
          ) {
            const invalidCheck = checkNonEmptyValues(
              values[value],
              setting.datatype
            );

            if (invalidCheck) {
              tabInvalid = true;
            }
          } else {
            if (setting.datatype === "integer" && value === "port") {
              if (values[value] > 65535) {
                tabInvalid = true;
              }
            }
          }
        });
      });
    }

    if (selectedTab === "advanced" || tabValue === "all") {
      selectedSource.advanced?.forEach((setting: object) => {
        Object.keys(values).forEach((value: string) => {
          if (
            !setting.options &&
            setting.name === value &&
            values[value] !== "" &&
            setting.datatype !== "integer"
          ) {
            const invalidCheck = checkNonEmptyValues(
              values[value],
              setting.datatype
            );
            if (invalidCheck) {
              tabInvalid = true;
            }
          } else {
            if (setting.datatype === "integer" && setting.name === "port") {
              if (values[value] > 65535) {
                tabInvalid = true;
              }
            }
          }
        });
      });
    }

    if (selectedTab === "fields" || tabValue === "all") {
      selectedSource.fields?.forEach((setting: object) => {
        Object.keys(values).forEach((value: string) => {
          if (
            !setting.options &&
            setting.name === value &&
            values[value] !== "" &&
            setting.datatype !== "integer"
          ) {
            const invalidCheck = checkNonEmptyValues(
              values[value],
              setting.datatype
            );

            if (invalidCheck) {
              tabInvalid = true;
            }
          } else {
            if (setting.datatype === "integer" && setting.name === "port") {
              if (values[value] > 65535) {
                tabInvalid = true;
              }
            }
          }
        });
      });
    }

    return tabInvalid;
  };

  const onTopicChange = (value: string, index: number) => {
    let currentTopics = topics;

    currentTopics[index] = value;

    setTopics((prevList) => [...currentTopics]);
  };

  const onAddTopic = () => {
    const topic = "";

    setTopics((prevList) => [...prevList, topic]);
  };

  const onRemoveTopic = (index: number) => {
    let prevTopics = topics;
    prevTopics.splice(index, 1);

    setTopics((prevList) => [...prevTopics]);
  };

  const onDeleteClick = () => {
    setConfirmDelete(true);
  };

  const onDeleteConfirm = () => {
    setConfirmDelete(false);
    onSaveSettings("delete");
  };

  const handleClose = () => {
    setConfirmDelete(false);
  };

  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      placement="start"
      className="offcanvas-sub"
    >
      <Offcanvas.Header closeButton>
        <div>
          <Offcanvas.Title style={{ fontSize: "15px" }}>
            Source &#60; {selectedSource.name}
          </Offcanvas.Title>

          <Offcanvas.Title>New {selectedSource.name}</Offcanvas.Title>
        </div>
      </Offcanvas.Header>

      <Offcanvas.Body>
        <Row>
          <Col lg={4} className="settings-div">
            <div
              className={`settings-menu pointer ${
                selectedTab === "setting" && `settings-selected-menu`
              }`}
              onClick={() => {
                onTabSelect("setting");
              }}
            >
              General Settings
            </div>

            {selectedSource.authentication && (
              <div
                className={`settings-menu pointer ${
                  selectedTab === "auth" && `settings-selected-menu`
                }`}
                onClick={() => {
                  onTabSelect("auth");
                }}
              >
                Authentication
              </div>
            )}

            {selectedSource.advanced && (
              <div
                className={`settings-menu pointer ${
                  selectedTab === "advanced" && `settings-selected-menu`
                }`}
                onClick={() => {
                  onTabSelect("advanced");
                }}
              >
                Advanced Settings
              </div>
            )}

            <div
              className={`settings-menu pointer ${
                selectedTab === "fields" && `settings-selected-menu`
              }`}
              onClick={() => {
                onTabSelect("fields");
              }}
            >
              Fields
            </div>
          </Col>

          <Col lg={8}>
            {selectedTab === "setting" ? (
              selectedSource.settings?.map((setting: any) => (
                <>
                  {setting.datatype !== "boolean" && (
                    <Form.Label htmlFor={setting.name}>
                      {setting.label}{" "}
                      {setting.tooltip && (
                        <OverlayTrigger
                          placement="right"
                          overlay={
                            <Tooltip id={setting.name}>
                              {setting.tooltip}
                            </Tooltip>
                          }
                        >
                          <QuestionCircle size={14} />
                        </OverlayTrigger>
                      )}
                    </Form.Label>
                  )}

                  {setting.options ? (
                    setting.datatype === "boolean" ? (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Form.Label htmlFor={setting.name}>
                          {setting.label}{" "}
                          {setting.tooltip && (
                            <OverlayTrigger
                              placement="right"
                              overlay={
                                <Tooltip id={setting.name}>
                                  {setting.tooltip}
                                </Tooltip>
                              }
                            >
                              <QuestionCircle size={14} />
                            </OverlayTrigger>
                          )}
                        </Form.Label>

                        <Form.Check // prettier-ignore
                          type="switch"
                          id={setting.name}
                          checked={formik.values[setting.name]}
                          defaultChecked={setting.default}
                          onChange={formik.handleChange}
                          style={{ marginLeft: "8px" }}
                        />
                      </div>
                    ) : (
                      <Form.Select
                        aria-label="Select"
                        className="mb-3"
                        size="sm"
                        onChange={formik.handleChange}
                        id={setting.name}
                        value={formik.values[setting.name]}
                      >
                        <option value="" hidden>
                          Select {setting.name}
                        </option>
                        {setting.options.map((option: string) => (
                          <option value={option}>{option}</option>
                        ))}
                      </Form.Select>
                    )
                  ) : setting.name === "region" ? (
                    <Form.Select
                      aria-label="Select"
                      className="mb-3"
                      size="sm"
                      id={setting.name}
                      onChange={formik.handleChange}
                      value={formik.values[setting.name]}
                    >
                      <option value="" hidden>
                        Select {setting.label}
                      </option>

                      {regions?.regions?.map((option: any) => (
                        <option value={option.value}>
                          {option.name} ({option.value})
                        </option>
                      ))}
                    </Form.Select>
                  ) : setting.name === "topics" ? (
                    topics.map((topic, index) => (
                      <div>
                        <div
                          style={{ display: "flex", alignItems: "baseline" }}
                        >
                          <Form.Control
                            placeholder={`Enter ${setting.label}`}
                            aria-label={setting.name}
                            aria-describedby={setting.name}
                            className="mb-3"
                            size="sm"
                            id={setting.name}
                            onChange={(event) => {
                              onTopicChange(event.target.value, index);
                            }}
                            value={topic}
                            maxLength={80}
                            type={"text"}
                          />

                          {index === 0 ? (
                            <Button
                              onClick={() => {
                                onAddTopic();
                              }}
                              style={{ marginLeft: "8px" }}
                              size="sm"
                            >
                              +
                            </Button>
                          ) : (
                            <Button
                              onClick={() => {
                                onRemoveTopic(index);
                              }}
                              style={{ marginLeft: "8px" }}
                              size="sm"
                            >
                              -
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <Form.Control
                      placeholder={`Enter ${setting.label}`}
                      aria-label={setting.name}
                      aria-describedby={setting.name}
                      className="mb-3"
                      size="sm"
                      id={setting.name}
                      onChange={formik.handleChange}
                      value={formik.values[setting.name]}
                      maxLength={setting.maxChar || 20}
                      type={setting.datatype === "integer" ? "number" : "text"}
                      isInvalid={invalidCheck(setting)}
                      min={0}
                      max={65535}
                    />
                  )}
                </>
              ))
            ) : selectedTab === "fields" ? (
              <div>
                <h6 style={{ fontSize: "14px" }} className="mb-3">
                  These fields are optional, however they help identify the data
                  source and how it should be processed.
                </h6>
                {sources.fields.map((field: any) => (
  <div
  style={{
    display: "flex",
    flexDirection: "column",  // Changed to column to stack elements
    width: "100%"
  }}
    className="mb-3"
    key={field.label}
  >
    {field.label === "log.source_type" && (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        width: "100%", 
        marginBottom: "13px",
        justifyContent: "space-between" 
      }}>
        <Form.Label style={{ margin: 0 }}>Add Source Log Type
        </Form.Label>
        <Form.Check
          type="switch"
          id="source-fields-toggle"
          checked={showSourceFields}
          onChange={(e) => setShowSourceFields(e.target.checked)}
        />
      </div>
    )}

    {((field.label !== "log.source_type" && field.label !== "log.source_name") || 
      (showSourceFields && (field.label === "log.source_type" || field.label === "log.source_name"))) && (
      <>
        {field.datatype !== "boolean" && (
          <Form.Label
            htmlFor={field.name}
            style={{
              marginRight: "8px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {field.label}
            {field.tooltip && (
              <OverlayTrigger
                placement="right"
                overlay={
                  <Tooltip id={field.name}>{field.tooltip}</Tooltip>
                }
              >
                <QuestionCircle
                  size={14}
                  style={{ marginLeft: "4px" }}
                />
              </OverlayTrigger>
            )}
          </Form.Label>
        )}


        {field.options ? (
          field.datatype === "boolean" ? (
            <Form.Check
              type="switch"
              id={field.name}
              label={
                <Form.Label
                  htmlFor={field.name}
                  style={{ marginRight: "8px" }}
                >
                  {field.label}
                  {field.tooltip && (
                    <OverlayTrigger
                      placement="right"
                      overlay={
                        <Tooltip id={field.name}>
                          {field.tooltip}
                        </Tooltip>
                      }
                    >
                      <QuestionCircle size={14} />
                    </OverlayTrigger>
                  )}
                </Form.Label>
              }
              checked={formik.values[field.name]}
              defaultChecked={field.default}
              onChange={formik.handleChange}
            />
          ) :field.label === "log.source_type" ? (
            <div className="mb-3 position-relative">
              <div className="dropdown">
                <div className="position-relative">
                  <Form.Control
                    aria-label="Search Log Source Type"
                    className="form-control-sm dropdown-toggle"
                    type="text"
                    id={field.label}
                    placeholder="Select or search log source type"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onFocus={() => setDropdownOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setDropdownOpen(false);
                      } else if (e.key === 'Enter' && sourceTypes.length > 0) {
                        e.preventDefault();
                        const firstType = sourceTypes[0];
                        formik.setFieldValue("log.source_type", firstType.value, true);
                        setSearchInput(firstType.label);
                        setDropdownOpen(false);
                      }
                    }}
                    value={searchInput}
                  />
                  
                  {searchInput && (
                    <Button
                      variant="link"
                      size="sm"
                      style={{
                        position: 'absolute',
                        right: '5px',
                        top: '0px',
                        zIndex: 10,
                        padding: '4px',
                        backgroundColor: 'transparent'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchInput('');
                        formik.setFieldValue("log.source_type", "", true);
                      }}
                    >
                      ×
                    </Button>
                  )}
                </div>
                
                <div 
                  className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}
                  id="source-type-dropdown"
                  style={{width: '100%', maxHeight: '200px', overflowY: 'auto'}}
                >
                  {sourceTypes.length > 0 ? (
                    sourceTypes.map((type) => (
                      <button 
                        key={type.value}
                        className="dropdown-item" 
                        type="button"
                        onClick={() => {
                          formik.setFieldValue("log.source_type", type.value, true);
                          setSearchInput(type.label);
                          setDropdownOpen(false);
                        }}
                      >
                        {type.label}
                      </button>
                    ))
                  ) : (
                    <div className="dropdown-item text-muted" style={{pointerEvents: 'none'}}>
                      No matches found
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Form.Select
              aria-label="Select Log Schema"
              className="mb-3"
              size="sm"
              id={field.label}
              onChange={formik.handleChange}
              value={
                formik.values.log
                  ? field.label === "log.schema"
                    ? formik.values.log.schema
                    : formik.values.log.format
                  : field.label === "log.schema"
                  ? formik.values["log.schema"]
                  : formik.values["log.format"]
              }
            >
              <option value="" hidden>
                Select {field.label}
              </option>
              {field.options.map((value: string) => (
                <option value={value}>{value}</option>
              ))}
            </Form.Select>
          )
        ) : field.label === "log.source_name" ? (
          <Form.Control
            placeholder="Enter Log Source Name"
            aria-label={field.label}
            aria-describedby={field.label}
            className="mb-3"
            size="sm"
            id={field.label}
            onChange={formik.handleChange}
            value={
              formik.values.log
                ? formik.values.log.source_name
                : formik.values["log.source_name"]
            }
            maxLength={80}
            type="text"
          />
        ) : (
          <Form.Control
            placeholder={`Enter ${field.name}`}
            aria-label={field.label}
            aria-describedby={field.label}
            size="sm"
            id={field.label}
            onChange={formik.handleChange}
            value={formik.values["organization"].id}
            maxLength={field.maxChar || 20}
            type={field.datatype === "integer" ? "number" : "text"}
            isInvalid={invalidCheck(field)}
          />
        )}
      </>
    )}
  </div>
))}
              </div>
            ) : selectedTab === "advanced" ? (
              selectedSource.advanced?.map((option: any) => (
                <>
                  {option.datatype !== "boolean" && (
                    <Form.Label htmlFor={option.name}>
                      {option.label}{" "}
                      {option.tooltip && (
                        <OverlayTrigger
                          placement="right"
                          overlay={
                            <Tooltip id={option.name}>{option.tooltip}</Tooltip>
                          }
                        >
                          <QuestionCircle size={14} />
                        </OverlayTrigger>
                      )}
                    </Form.Label>
                  )}

                  {option.options ? (
                    option.datatype === "boolean" ? (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Form.Label htmlFor={option.name}>
                          {option.label}{" "}
                          {option.tooltip && (
                            <OverlayTrigger
                              placement="right"
                              overlay={
                                <Tooltip id={option.name}>
                                  {option.tooltip}
                                </Tooltip>
                              }
                            >
                              <QuestionCircle size={14} />
                            </OverlayTrigger>
                          )}
                        </Form.Label>

                        <Form.Check // prettier-ignore
                          type="switch"
                          id={option.name}
                          checked={formik.values[option.name]}
                          defaultChecked={formik.values[option.name]}
                          onChange={formik.handleChange}
                          style={{ marginLeft: "8px" }}
                        />
                      </div>
                    ) : (
                      <Form.Select
                        aria-label="Select"
                        className="mb-3"
                        size="sm"
                        onChange={formik.handleChange}
                        id={option.name}
                        value={formik.values[option.name]}
                      >
                        <option value="" hidden>
                          Select {option.label}
                        </option>
                        {option.options.map((option: string) => (
                          <option value={option}>{option}</option>
                        ))}
                      </Form.Select>
                    )
                  ) : (
                    <Form.Control
                      placeholder={`Enter ${option.label}`}
                      aria-label={option.name}
                      aria-describedby={option.name}
                      className="mb-3"
                      size="sm"
                      id={option.name}
                      onChange={formik.handleChange}
                      value={formik.values[option.name]}
                      maxLength={option.maxChar || 20}
                      type={option.datatype === "integer" ? "number" : "text"}
                      isInvalid={invalidCheck(option)}
                    />
                  )}
                </>
              ))
            ) : selectedSource.authentication.dropdownOptions ? (
              <Form>
                <Form.Label htmlFor={"auth"}>
                  Select Authentication{" "}
                  {selectedSource.authentication.tooltip && (
                    <OverlayTrigger
                      placement="left"
                      overlay={
                        <Tooltip id={"auth"}>
                          {selectedSource.authentication.tooltip}
                        </Tooltip>
                      }
                    >
                      <QuestionCircle size={14} />
                    </OverlayTrigger>
                  )}
                </Form.Label>

                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <Form.Select
                    aria-label="Select"
                    className="mb-3"
                    size="sm"
                    id={"auth"}
                    onChange={(event) => {
                      onCheck(event.target.value);
                    }}
                    value={authIndex}
                  >
                    <option value="" hidden>
                      Select Authentication
                    </option>
                    {selectedSource.authentication.dropdownOptions?.map(
                      (option: any, index: number) => (
                        <option value={index}>{option.label}</option>
                      )
                    )}
                  </Form.Select>

                  {authIndex &&
                    selectedSource.authentication.dropdownOptions[authIndex]
                      .tooltip && (
                      <OverlayTrigger
                        placement="left"
                        overlay={
                          <Tooltip id={selectedSource.authentication.name}>
                            {
                              selectedSource.authentication.dropdownOptions[
                                authIndex
                              ].tooltip
                            }
                          </Tooltip>
                        }
                      >
                        <QuestionCircle
                          size={14}
                          style={{ margin: "0 16px" }}
                        />
                      </OverlayTrigger>
                    )}
                </div>

                {authIndex && (
                  <>
                    {selectedSource.authentication.dropdownOptions[
                      authIndex
                    ].fieldsToShow.map((setting: any) => (
                      <>
                        <Form.Label htmlFor={setting.name}>
                          {setting.label}{" "}
                          {setting.tooltip && (
                            <OverlayTrigger
                              placement="right"
                              overlay={
                                <Tooltip id={setting.name}>
                                  {setting.tooltip}
                                </Tooltip>
                              }
                            >
                              <QuestionCircle size={14} />
                            </OverlayTrigger>
                          )}
                        </Form.Label>

                        {setting.name === "auth_region" ? (
                          <Form.Select
                            aria-label="Select"
                            className="mb-3"
                            size="sm"
                            id={setting.name}
                            onChange={formik.handleChange}
                            value={formik.values[setting.name]}
                          >
                            <option value="" hidden>
                              Select Region
                            </option>
                            {regions?.regions?.map((option: any) => (
                              <option value={option.value}>
                                {option.name} ({option.value})
                              </option>
                            ))}
                          </Form.Select>
                        ) : (
                          <Form.Control
                            placeholder={`Enter ${setting.placeholder}`}
                            aria-label={setting.name}
                            aria-describedby={setting.name}
                            className="mb-3"
                            size="sm"
                            id={setting.name}
                            onChange={formik.handleChange}
                            value={formik.values[setting.name]}
                            maxLength={setting.maxChar || 20}
                            type={
                              setting.datatype === "integer" ? "number" : "text"
                            }
                            isInvalid={invalidCheck(setting)}
                          />
                        )}
                      </>
                    ))}
                  </>
                )}
              </Form>
            ) : (
              selectedSource.authentication?.fields.map((authFields: any) => (
                <>
                  {selectedSource.authentication.name === "sasl" &&
                    formik.values.enabled &&
                    authFields.datatype !== "boolean" && (
                      <Form.Label htmlFor={authFields.name}>
                        {authFields.label}{" "}
                        {authFields.tooltip && (
                          <OverlayTrigger
                            placement="right"
                            overlay={
                              <Tooltip id={authFields.name}>
                                {authFields.tooltip}
                              </Tooltip>
                            }
                          >
                            <QuestionCircle size={14} />
                          </OverlayTrigger>
                        )}
                      </Form.Label>
                    )}

                  {authFields.options ? (
                    authFields.datatype === "boolean" ? (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Form.Label htmlFor={authFields.name}>
                          {authFields.label}{" "}
                          {authFields.tooltip && (
                            <OverlayTrigger
                              placement="right"
                              overlay={
                                <Tooltip id={authFields.name}>
                                  {authFields.tooltip}
                                </Tooltip>
                              }
                            >
                              <QuestionCircle size={14} />
                            </OverlayTrigger>
                          )}
                        </Form.Label>

                        <Form.Check // prettier-ignore
                          type="switch"
                          id={authFields.name}
                          defaultChecked={authFields.default}
                          onChange={formik.handleChange}
                          style={{ marginLeft: "8px" }}
                          checked={formik.values[authFields.name]}
                        />
                      </div>
                    ) : selectedSource.authentication.name === "sasl" &&
                      !formik.values.enabled ? null : (
                      <Form.Select
                        aria-label="Select"
                        className="mb-3"
                        size="sm"
                        id={authFields.name}
                        onChange={formik.handleChange}
                        value={formik.values[authFields.name]}
                      >
                        <option value="" hidden>
                          Select {authFields.label}
                        </option>
                        {authFields.options?.map((option: any) => (
                          <option value={option}>{option}</option>
                        ))}
                      </Form.Select>
                    )
                  ) : selectedSource.authentication.name === "sasl" &&
                    !formik.values.enabled ? null : (
                    <Form.Control
                      placeholder={`Enter ${authFields.placeholder}`}
                      aria-label={authFields.name}
                      aria-describedby={authFields.name}
                      className="mb-3"
                      size="sm"
                      id={authFields.name}
                      onChange={formik.handleChange}
                      value={formik.values[authFields.name]}
                      maxLength={authFields.maxChar || 20}
                      type={
                        authFields.datatype === "integer" ? "number" : "text"
                      }
                      isInvalid={invalidCheck(authFields)}
                    />
                  )}
                </>
              ))
            )}
          </Col>
        </Row>

        <Row>
          <Col xl={4} lg={4} md={4} sm={4}></Col>

          <Col
            lg={8}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div>
              {selectedNode !== undefined && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={onDeleteClick}
                  style={{ marginRight: "8px" }}
                >
                  Delete Node
                </Button>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "end",
              }}
            >
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onBackClick}
                style={{ marginRight: "8px" }}
              >
                {selectedTab !== "setting" ? " Back" : "Cancel"}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={onNextClick}
                disabled={
                  selectedTab !== "fields"
                    ? checkTabValues("")
                    : checkFormValid(formik.values) || checkTabValues("all")
                }
              >
                {selectedTab === "fields"
                  ? selectedNode !== undefined
                    ? "Update"
                    : "Save"
                  : "Next"}
              </Button>
            </div>
          </Col>
        </Row>

        {confirmDelete && (
          <Modal show={confirmDelete} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Delete Source?</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              Are you sure you want to delete this source node?
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                No
              </Button>

              <Button variant="primary" onClick={onDeleteConfirm}>
                Yes
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default EditSourceData;