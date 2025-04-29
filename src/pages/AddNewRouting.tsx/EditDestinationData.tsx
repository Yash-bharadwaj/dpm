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

import { useState } from "react";
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

toastConfig({ theme: "dark" });

const EditDestinationData = ({
  show,
  onHide,
  selectedDestination,
  onSaveSettings,
  selectedNode,
  addedNodes,
}: any) => {
  const [selectedTab, setSelectedTab] = useState("setting");
  const [authIndex, setAuthIndex] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  let destInitialValues = {};
  let mandatoryFields = [];

  const resetMandatoryFields = (index: any) => {};

  selectedDestination.settings.forEach((setting: any) => {
    if (setting.name === "name") {
      destInitialValues[setting.name] =
        selectedNode?.data.nodeData[setting.name] || setting.default || [];
    } else {
      if (selectedNode !== undefined && selectedNode?.data.nodeData?.address) {
        let address = selectedNode?.data.nodeData?.address.split(":");
  
        if (setting.name === "address") {
          destInitialValues["address"] = address[0];
        }
        if (setting.name === "port") {
          destInitialValues["port"] = address[1];
        }
      } else if (setting.name === "encoding" && selectedNode !== undefined) {
        destInitialValues[setting.name] =
          selectedNode?.data.nodeData["encoding"]?.codec || setting.default || "";
      } else {
        destInitialValues[setting.name] =
          selectedNode?.data.nodeData[setting.name] || setting.default || "";
      }
    }
    if (setting.mandatory) {
      mandatoryFields.push(setting.name);
    }
  });

  selectedDestination.advanced?.forEach((advanced: any) => {
    if (advanced.datatype === "boolean") {
      if (advanced.name === "tls") {
        destInitialValues[advanced.name] =
          selectedNode !== undefined &&
          selectedNode?.data.nodeData["tls"].enabled !== ""
            ? selectedNode?.data.nodeData["tls"].enabled === false
              ? false
              : true
            : advanced.default || false;
      } else {
        destInitialValues[advanced.name] =
          selectedNode !== undefined
            ? selectedNode?.data.nodeData[advanced.name] !== ""
              ? selectedNode?.data.nodeData[advanced.name] === false
                ? false
                : true
              : advanced.default || false
            : advanced.default || false;
      }
    } else {
      if (advanced.name === "codec") {
        destInitialValues[advanced.name] =
          selectedNode?.data.nodeData["encoding"].codec ||
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

        destInitialValues["permit_origin"] = permitValues;
      } else {
        destInitialValues[advanced.name] =
          selectedNode?.data.nodeData[advanced.name] || advanced.default || "";
      }
    }

    if (advanced.mandatory) {
      mandatoryFields.push(advanced.name);
    }
  });

  if (selectedDestination.authentication) {
    if (selectedDestination.authentication.dropdownOptions) {
      selectedDestination.authentication.dropdownOptions.forEach(
        (option: any) => {
          option.fieldsToShow.forEach((fields: any) => {
            let authType = "auth";
            if (selectedNode?.data.nodeData.type === "kafka") {
              authType = "sasl";
            }

            if (fields.datatype === "boolean") {
              destInitialValues[fields.name] =
                selectedNode?.data.nodeData[authType][fields.name] !== ""
                  ? selectedNode?.data.nodeData[authType][fields.name] === false
                    ? false
                    : true
                  : fields.default || "";
            } else {
              if (fields.name === "auth_region") {
                destInitialValues[fields.name] =
                  selectedNode?.data.nodeData.auth["region"] ||
                  fields.default ||
                  "";
              } else {
                destInitialValues[fields.name] =
                  selectedNode?.data.nodeData[authType][fields.name] ||
                  fields.default ||
                  "";
              }
            }

            if (fields.mandatory) {
              mandatoryFields.push(fields.name);
            }
          });
        }
      );
    } else {
      selectedDestination.authentication.fields.forEach((field: any) => {
        let authType = "auth";
        if (selectedNode?.data.nodeData.type === "kafka") {
          authType = "sasl";
        }

        if (
          field.datatype === "boolean" &&
          selectedNode?.data.nodeData[authType]
        ) {
          destInitialValues[field.name] =
            selectedNode?.data.nodeData[authType][field.name] !== "" &&
            selectedNode?.data.nodeData[authType][field.name] !== undefined
              ? selectedNode?.data.nodeData[authType][field.name] === false
                ? false
                : true
              : field.default || false;
        } else {
          if (selectedNode?.data.nodeData[authType]) {
            destInitialValues[field.name] =
              selectedNode?.data.nodeData[authType][field.name] ||
              field.default ||
              "";
          } else {
            destInitialValues[field.name] = field.default || "";
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
      selectedNode.data.nodeData.type === "aws_s3"
    ) {
      if (destInitialValues["access_key_id"] !== "") {
        setAuthIndex("0");

        const fieldIndex = mandatoryFields.findIndex(checkAccessAuthFields);

        mandatoryFields.splice(fieldIndex, 1);
      }
      if (destInitialValues["assume_role"] !== "") {
        setAuthIndex("1");

        const indexOne = mandatoryFields.findIndex(checkAssumeAuthFieldsOne);
        mandatoryFields.splice(indexOne, 1);

        const indexTwo = mandatoryFields.findIndex(checkAssumeAuthFieldsTwo);
        mandatoryFields.splice(indexTwo, 1);
      }
    }
  }

  if (selectedDestination["processing-settings"]) {
    selectedDestination["processing-settings"].forEach((setting: any) => {
      destInitialValues[setting.name] =
        selectedNode?.data.nodeData[setting.name] || setting.default || "";

      if (setting.mandatory) {
        mandatoryFields.push(setting.name);
      }
    });
  }

  const [checkMandatoryFields, setMandatoryFields] = useState(mandatoryFields);

  const validateForm = async (values: any) => {
    return checkFormValid(values);
  };

  const checkFormValid = (values: any) => {
    let error = false;

    checkMandatoryFields.forEach((field) => {
      if (values[field] === "") {
        error = true;
      }
    });

    return error;
  };

  const formik = useFormik({
    initialValues: destInitialValues,
    onSubmit: (values) => {
      console.log(JSON.stringify(values, null, 2));
    },
    validate: validateForm,
    validateOnBlur: true,
    validateOnChange: true,
  });

  const onTabSelect = (tab: string) => {
    setSelectedTab(tab);
  };

  const onCheck = (index: number) => {
    setAuthIndex(index);

    selectedDestination.authentication.dropdownOptions[
      index
    ].fieldsToShow.forEach((field: object) => {
      formik.setFieldValue(field?.name, "");
    });

    resetMandatoryFields(index);

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
      if (selectedDestination.authentication) {
        setSelectedTab("auth");
      } else if (selectedDestination.advanced) {
        setSelectedTab("advanced");
      } else if (selectedDestination.batch_buffer) {
        setSelectedTab("batch_buffer");
      } else if (selectedDestination["processing-settings"]) {
        setSelectedTab("processing");
      } else {
        saveSettings();
      }
    } else if (selectedTab === "auth") {
      if (selectedDestination.advanced) {
        setSelectedTab("advanced");
      } else if (selectedDestination.batch_buffer) {
        setSelectedTab("batch_buffer");
      } else if (selectedDestination["processing-settings"]) {
        setSelectedTab("processing");
      } else {
        saveSettings();
      }
    } else if (selectedTab === "advanced") {
      if (selectedDestination.batch_buffer) {
        setSelectedTab("batch_buffer");
      } else if (selectedDestination["processing-settings"]) {
        setSelectedTab("processing");
      } else {
        saveSettings();
      }
    } else if (selectedTab === "batch_buffer") {
      if (selectedDestination["processing-settings"]) {
        setSelectedTab("processing");
      } else {
        saveSettings();
      }
    } else if (selectedTab === "processing") {
      saveSettings();
    }
  };
 
const saveSettings = () => {
  const destValues: any = {};

  let nameAvailable = true;

  if (addedNodes.length !== 0) {
    const name = formik.values["name"];
    addedNodes.forEach((node: any) => {
      const enteredName = name.replaceAll(" ", "_");
      const inputName = selectedNode ? enteredName : "output_" + enteredName;
      if (
        node.data.nodeData.name === inputName &&
        selectedNode?.id !== node.id
      ) {
        nameAvailable = false;
      }
    });
  }

  if (!nameAvailable) {
    toast(
      "Destination name is already used in configuration, please enter a different name.",
      {
        position: "top-right",
        zIndex: 9999,
        theme: "failure",
      }
    );
    return;
  }

  const keys = Object.keys(formik.values);

  keys.forEach((item) => {
    if (
      formik.values[item] !== "" ||
      item === "tls" ||
      item === "enabled"
    ) {
      if (item === "name") {
        const name = formik.values.name.replaceAll(" ", "_");
        if (selectedNode === undefined) {
          destValues.name = "output_" + name;
        } else {
          destValues.name = name;
        }
      } else if (item === "address") {
        destValues["address"] =
          formik.values["address"] + ":" + formik.values["port"].toString();
      } else if (item === "codec" || item === "tls" || item === "encoding") {
        if (item === "tls") {
          destValues["tls"] = { enabled: formik.values["tls"] };
        } else if (item === "encoding") {
          destValues["encoding"] = {
            codec: formik.values["encoding"],
          };
        } else {
          destValues["encoding"] = {
            codec: formik.values["codec"],
          };
        }
      } else if (item === "inputs") {
        destValues[item] = [];
      } else if (item === "compression") {
        if (Array.isArray(formik.values["compression"])) {
          if (formik.values["compression"][0] === "on") {
            destValues["compression"] = true;
          } else {
            destValues["compression"] = false;
          }
        } else {
          destValues["compression"] = formik.values["compression"];
        }
      } else if (item === "healthcheck") {
        destValues.healthcheck = {
          enabled: formik.values["healthcheck"],
        };
      } else if (item === "framing" || item === "method") {
        if (formik.values["method"]) {
          destValues.framing = {
            method: formik.values["method"] || "",
          };
        }
      } else {
        // Handle authentication fields
        if (authIndex !== null && selectedDestination.authentication?.dropdownOptions) {
          destValues["auth"] = {};
          selectedDestination.authentication.dropdownOptions[authIndex].fieldsToShow.forEach((field: any) => {
            if (field.name === "auth_region") {
              if (formik.values[field.name] !== "") {
                destValues.auth["region"] = formik.values[field.name];
              }
            } else {
              destValues.auth[field.name] = formik.values[field.name];
            }
          });
        }

        if (formik.values.enabled && selectedDestination.authentication?.name === "sasl") {
          destValues["sasl"] = {
            enabled: formik.values.enabled,
          };
          selectedDestination.authentication.fields.forEach((field: any) => {
            if (field.name === "enabled") {
              destValues.sasl.enabled = true;
            } else {
              if (formik.values[field.name] !== "") {
                destValues.sasl[field.name] = formik.values[field.name];
              }
            }
          });
        }

        // Only add if not already handled by auth/sasl
        if (
          (!destValues.auth || destValues.auth[item] === undefined) &&
          (!destValues.sasl || destValues.sasl[item] === undefined)
        ) {
          if (
            item !== "enabled" &&
            item !== "assume_role" &&
            item !== "access_key_id" &&
            item !== "secret_access_key" &&
            item !== "auth_region" &&
            item !== "mechanism" &&
            item !== "username" &&
            item !== "password" &&
            item !== "port"
          ) {
            destValues[item] = formik.values[item];
          }
        }
      }
    }
  });

  // --- Batch & Buffer Section ---
  if (selectedDestination.batch_buffer) {
    selectedDestination.batch_buffer.forEach((section: any) => {
      if (section.name === "batch" || section.name === "buffer") {
        const sectionObj: any = {};
        section.fields.forEach((field: any) => {
          let value = formik.values[field.name];
          if (value === "" || value === undefined) {
            value = field.default;
          }
          if (field.datatype === "integer") {
            sectionObj[field.name] = value !== undefined ? Number(value) : undefined;
          } else {
            sectionObj[field.name] = value;
          }
        });
        destValues[section.name] = sectionObj;
      }
    });
  }

  // --- Processing Settings Section ---
  if (selectedDestination["processing-settings"]) {
    selectedDestination["processing-settings"].forEach((setting: any) => {
      destValues[setting.name] = formik.values[setting.name];
    });
  }

  destValues["type"] = selectedDestination.type;
  destValues["uuid"] = selectedDestination.uuid;

  onSaveSettings(destValues);
};

  const onBackClick = () => {
    if (selectedTab === "setting") {
      onHide();
    } else if (selectedTab === "auth") {
      setSelectedTab("setting");
    } else if (selectedTab === "advanced") {
      if (selectedDestination.auth) {
        setSelectedTab("auth");
      } else {
        setSelectedTab("setting");
      }
    } else if (selectedTab === "fields") {
      if (selectedDestination.authentication) {
        setSelectedTab("auth");
      } else if (selectedDestination.advanced) {
        setSelectedTab("advanced");
      } else {
        setSelectedTab("setting");
      }
    }
  };

  const onClose = () => {
    formik.resetForm();

    onHide();
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
        setting.datatype === "password" ||
        setting.datatype === "text-special"
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
      datatype === "password" ||
      datatype === "text-special"
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
      selectedDestination.settings.forEach((setting: object) => {
        Object.keys(values).forEach((value: string) => {
          if (
            !setting.options &&
            setting.name === value &&
            values[value] !== "" &&
            setting.datatype !== "integer"
          ) {
            const invalid = checkNonEmptyValues(
              values[value],
              setting.datatype
            );

            if (invalid) {
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

    if (selectedTab === "advanced" || tabValue === "all") {
      selectedDestination.advanced.forEach((setting: object) => {
        Object.keys(values).forEach((value: string) => {
          if (
            !setting.options &&
            setting.name === value &&
            values[value] !== "" &&
            setting.datatype !== "integer"
          ) {
            const invalid = checkNonEmptyValues(
              values[value],
              setting.datatype
            );

            if (invalid) {
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
      placement="end"
      className="offcanvas-sub"
    >
      <Offcanvas.Header closeButton>
        <div>
          <Offcanvas.Title style={{ fontSize: "15px" }}>
            Destination &#60; {selectedDestination.name}
          </Offcanvas.Title>

          <Offcanvas.Title>New {selectedDestination.name}</Offcanvas.Title>
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

            {selectedDestination.authentication && (
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

            {selectedDestination.advanced && (
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
          {selectedDestination.batch_buffer && (
  <div
    className={`settings-menu pointer ${selectedTab === "batch_buffer" && `settings-selected-menu`}`}
    onClick={() => { setSelectedTab("batch_buffer"); }}
  >
    Batch & Buffer Settings
  </div>
)}
{selectedDestination["processing-settings"] && (
  <div
    className={`settings-menu pointer ${selectedTab === "processing" && `settings-selected-menu`}`}
    onClick={() => { setSelectedTab("processing"); }}
  >
    Processing Settings
  </div>
)}


          </Col>

          <Col lg={8}>
            {selectedTab === "setting" ? (
              selectedDestination.settings?.map((setting: any) => (
                <>
                  {setting.name !== "inputs" &&
                    setting.datatype !== "boolean" && (
                      <Form.Label htmlFor="inputID">
                        {setting.label}{" "}
                        {setting.tooltip && (
                          <OverlayTrigger
                            placement="left"
                            overlay={
                              <Tooltip id="button-tooltip-2">
                                {setting.tooltip}
                              </Tooltip>
                            }
                          >
                            <QuestionCircle size={14} />
                          </OverlayTrigger>
                        )}
                      </Form.Label>
                    )}

                  {setting.name !== "inputs" &&
                    (setting.options ? (
                      setting.datatype === "boolean" ? (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Form.Label htmlFor="inputID">
                            {setting.label}{" "}
                            {setting.tooltip && (
                              <OverlayTrigger
                                placement="left"
                                overlay={
                                  <Tooltip id="button-tooltip-2">
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
                          Select {setting.name}
                        </option>
                        {regions?.regions?.map((option: any) => (
                          <option value={option.value}>
                            {option.name} ({option.value})
                          </option>
                        ))}
                      </Form.Select>
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
                        type={
                          setting.datatype === "integer" ? "number" : "text"
                        }
                        isInvalid={invalidCheck(setting)}
                      />
                    ))}
                </>
              ))
            ) : selectedTab === "processing" ? (
              selectedDestination["processing-settings"]?.map(
                (setting: any) => (
                  <>
                    {setting.name !== "inputs" &&
                      setting.datatype !== "boolean" && (
                        <Form.Label htmlFor="inputID">
                          {setting.label}{" "}
                          {setting.tooltip && (
                            <OverlayTrigger
                              placement="left"
                              overlay={
                                <Tooltip id="button-tooltip-2">
                                  {setting.tooltip}
                                </Tooltip>
                              }
                            >
                              <QuestionCircle size={14} />
                            </OverlayTrigger>
                          )}
                        </Form.Label>
                      )}

                    {setting.name !== "inputs" &&
                      (setting.options ? (
                        setting.datatype === "boolean" ? (
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Form.Label htmlFor="inputID">
                              {setting.label}{" "}
                              {setting.tooltip && (
                                <OverlayTrigger
                                  placement="left"
                                  overlay={
                                    <Tooltip id="button-tooltip-2">
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
                        ) : setting.options ? (
                          setting.options.map((option: any) =>
                            option.fields ? (
                              <Form.Select
                                aria-label="Select"
                                className="mb-3"
                                size="sm"
                                onChange={formik.handleChange}
                                id={option.name}
                                value={formik.values[setting.name][option.name]}
                              >
                                <option value="" hidden>
                                  Select {option.label}
                                </option>
                                {option.fields.map((field: any) => (
                                  <option value={field.name}>
                                    {field.name}
                                  </option>
                                ))}
                              </Form.Select>
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
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
                                  id={option.label}
                                  defaultChecked={option.default}
                                  onChange={formik.handleChange}
                                  style={{ marginLeft: "8px" }}
                                  checked={formik.values[option.label]}
                                />
                              </div>
                            )
                          )
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
                            type={
                              setting.datatype === "integer" ? "number" : "text"
                            }
                            isInvalid={invalidCheck(setting)}
                          />
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
                            Select {setting.name}
                          </option>
                          {regions?.regions?.map((option: any) => (
                            <option value={option.value}>
                              {option.name} ({option.value})
                            </option>
                          ))}
                        </Form.Select>
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
                          type={
                            setting.datatype === "integer" ? "number" : "text"
                          }
                          isInvalid={invalidCheck(setting)}
                        />
                      ))}
                  </>
                )
              )
            ) : selectedTab === "advanced" ? (
              selectedDestination.advanced?.map((setting: any) => (
                <>
                  {setting.datatype !== "boolean" && (
                    <Form.Label htmlFor="inputID">
                      {setting.label}{" "}
                      {setting.tooltip && (
                        <OverlayTrigger
                          placement="right"
                          overlay={
                            <Tooltip id="button-tooltip-2">
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
                        <Form.Label htmlFor="inputID">
                          {setting.label}{" "}
                          {setting.tooltip && (
                            <OverlayTrigger
                              placement="right"
                              overlay={
                                <Tooltip id="button-tooltip-2">
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
                          defaultChecked={formik.values[setting.name]}
                          onChange={formik.handleChange}
                          style={{ marginLeft: "8px" }}
                        />
                      </div>
                    ) : (
                      <>
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
                          {setting.options?.map((option: any) => (
                            <option value={option.name || option}>
                              {option.label || option}
                            </option>
                          ))}
                        </Form.Select>

                        {formik.values[setting.name] !== "" &&
                          setting.options.map((option: any) => {
                            if (
                              option.name === formik.values[setting.name] &&
                              option.fields
                            ) {
                              return (
                                <>
                                  <Form.Label htmlFor="inputID">
                                    {option.label}{" "}
                                    {option.tooltip && (
                                      <OverlayTrigger
                                        placement="right"
                                        overlay={
                                          <Tooltip id="button-tooltip-2">
                                            {option.tooltip}
                                          </Tooltip>
                                        }
                                      >
                                        <QuestionCircle size={14} />
                                      </OverlayTrigger>
                                    )}
                                  </Form.Label>

                                  <Form.Control
                                    placeholder={`Enter ${option.fields.label}`}
                                    aria-label={option.fields.name}
                                    aria-describedby={option.fields.name}
                                    className="mb-3"
                                    size="sm"
                                    id={option.fields.name}
                                    onChange={formik.handleChange}
                                    value={formik.values[option.fields.name]}
                                    maxLength={option.fields.maxChar || 20}
                                    type={
                                      setting.datatype === "integer"
                                        ? "number"
                                        : "text"
                                    }
                                    isInvalid={invalidCheck(setting)}
                                  />
                                </>
                              );
                            } else {
                              return null;
                            }
                          })}
                      </>
                    )
                  ) : setting.fields ? (
                    setting.fields.map((option: any) => {
                      return (
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
                            id={option.label}
                            defaultChecked={option.default}
                            onChange={formik.handleChange}
                            style={{ marginLeft: "8px" }}
                            checked={formik.values[option.label]}
                          />
                        </div>
                      );
                    })
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
                    />
                  )}
                </>
              ))
            ) 
            
         
            : selectedTab === "batch_buffer" ? (
              // Render Batch & Buffer Settings tab
              selectedDestination.batch_buffer?.map((section: any) => (
                <div key={section.name}>
                  <h5>{section.label}</h5>
                  {section.fields.map((field: any) => (
                    <Form.Group key={field.name} className="mb-3">
                      <Form.Label>
                        {field.label}{" "}
                        {field.tooltip && (
                          <OverlayTrigger
                            placement="right"
                            overlay={
                              <Tooltip id={`tooltip-${field.name}`}>
                                {field.tooltip}
                              </Tooltip>
                            }
                          >
                            <QuestionCircle size={14} />
                          </OverlayTrigger>
                        )}
                      </Form.Label>
                      {field.datatype === "dropdown" ? (
                        <Form.Select
                          aria-label={field.label}
                          id={field.name}
                          value={formik.values[field.name] || field.default}
                          onChange={formik.handleChange}
                        >
                          {field.options.map((option: string) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Form.Select>
                      ) : (
                        <Form.Control
                          type={field.datatype === "integer" ? "number" : "text"}
                          id={field.name}
                          value={formik.values[field.name] || field.default}
                          onChange={formik.handleChange}
                          placeholder={`Enter ${field.label}`}
                        />
                      )}
                    </Form.Group>
                  ))}
                </div>
              ))
          )
            : selectedDestination.authentication &&
              selectedDestination.authentication.dropdownOptions ? (
              <Form>
                <Form.Label htmlFor={"auth"}>
                  Select Authentication *{" "}
                  {selectedDestination.authentication.tooltip && (
                    <OverlayTrigger
                      placement="left"
                      overlay={
                        <Tooltip id="button-tooltip-2">
                          {selectedDestination.authentication.tooltip}
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
                    {selectedDestination.authentication.dropdownOptions?.map(
                      (option: any, index: number) => (
                        <option value={index}>{option.label}</option>
                      )
                    )}
                  </Form.Select>

                  {authIndex &&
                    selectedDestination.authentication.dropdownOptions[
                      authIndex
                    ].tooltip && (
                      <OverlayTrigger
                        placement="left"
                        overlay={
                          <Tooltip id="button-tooltip-2">
                            {
                              selectedDestination.authentication
                                .dropdownOptions[authIndex].tooltip
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
                    {selectedDestination.authentication.dropdownOptions[
                      authIndex
                    ].fieldsToShow.map((setting: any) => (
                      <>
                        <Form.Label htmlFor={setting.name}>
                          {setting.label}{" "}
                          {setting.tooltip && (
                            <OverlayTrigger
                              placement="left"
                              overlay={
                                <Tooltip id="button-tooltip-2">
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
              selectedDestination.authentication?.fields.map((setting: any) => (
                <>
                  {selectedDestination.authentication.name === "sasl" &&
                    formik.values.enabled &&
                    setting.datatype !== "boolean" && (
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
                          defaultChecked={setting.default}
                          onChange={formik.handleChange}
                          style={{ marginLeft: "8px" }}
                          checked={formik.values[setting.name]}
                        />
                      </div>
                    ) : selectedDestination.authentication.name === "sasl" &&
                      !formik.values.enabled ? null : (
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
                        {setting.options?.map((option: any) => (
                          <option value={option}>{option}</option>
                        ))}
                      </Form.Select>
                    )
                  ) : selectedDestination.authentication.name === "sasl" &&
                    !formik.values.enabled ? null : (
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
                      type={setting.datatype === "integer" ? "number" : "text"}
                      isInvalid={invalidCheck(setting)}
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
    // Disable if not on last tab and validation fails for current tab,
    // or if on last tab and form is invalid
    (() => {
      // Determine if this is the last tab
      let isLastTab = false;
      if (selectedTab === "processing") {
        isLastTab = true;
      } else if (
        !selectedDestination["processing-settings"] &&
        selectedTab === "batch_buffer"
      ) {
        isLastTab = true;
      } else if (
        !selectedDestination["processing-settings"] &&
        !selectedDestination.batch_buffer &&
        selectedTab === "advanced"
      ) {
        isLastTab = true;
      } else if (
        !selectedDestination["processing-settings"] &&
        !selectedDestination.batch_buffer &&
        !selectedDestination.advanced &&
        selectedTab === "auth"
      ) {
        isLastTab = true;
      } else if (
        !selectedDestination["processing-settings"] &&
        !selectedDestination.batch_buffer &&
        !selectedDestination.advanced &&
        !selectedDestination.authentication &&
        selectedTab === "setting"
      ) {
        isLastTab = true;
      }
      if (!isLastTab) {
        // Not last tab: validate current tab only
        return checkTabValues("");
      } else {
        // Last tab: validate all
        return checkFormValid(formik.values) || checkTabValues("all");
      }
    })()
  }
>
  {(() => {
    // Determine if this is the last tab
    let isLastTab = false;
    if (selectedTab === "processing") {
      isLastTab = true;
    } else if (
      !selectedDestination["processing-settings"] &&
      selectedTab === "batch_buffer"
    ) {
      isLastTab = true;
    } else if (
      !selectedDestination["processing-settings"] &&
      !selectedDestination.batch_buffer &&
      selectedTab === "advanced"
    ) {
      isLastTab = true;
    } else if (
      !selectedDestination["processing-settings"] &&
      !selectedDestination.batch_buffer &&
      !selectedDestination.advanced &&
      selectedTab === "auth"
    ) {
      isLastTab = true;
    } else if (
      !selectedDestination["processing-settings"] &&
      !selectedDestination.batch_buffer &&
      !selectedDestination.advanced &&
      !selectedDestination.authentication &&
      selectedTab === "setting"
    ) {
      isLastTab = true;
    }
    if (isLastTab) {
      return selectedNode !== undefined ? "Update" : "Save";
    }
    return "Next";
  })()}
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
              Are you sure you want to delete this destination node?
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

export default EditDestinationData;
