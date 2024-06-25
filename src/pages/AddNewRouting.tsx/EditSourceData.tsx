/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Button,
  Col,
  Form,
  Offcanvas,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import { QuestionCircle } from "react-bootstrap-icons";

import regions from "../../data/regions.json";
import sources from "../../data/sources.json";

import { useState } from "react";
import { useFormik } from "formik";
import { checkValueWithRegex } from "./helper";

const EditSourceData = ({
  show,
  onClose,
  selectedSource,
  onSaveSettings,
  selectedNode,
}: any) => {
  const [selectedTab, setSelectedTab] = useState("setting");
  const [authIndex, setAuthIndex] = useState(null);
  const [topics, setTopics] = useState([""]);

  let sourceInitialValues = {};
  let mandatoryFields = [];

  selectedSource.settings.forEach((setting: any) => {
    sourceInitialValues[setting.name] =
      selectedNode?.data.nodeData[setting.name] || setting.default || "";
    if (setting.mandatory) {
      mandatoryFields.push(setting.name);
    }
  });

  selectedSource.advanced?.forEach((advanced: any) => {
    sourceInitialValues[advanced.name] =
      selectedNode?.data.nodeData[advanced.name] || advanced.default || "";
    if (advanced.mandatory) {
      mandatoryFields.push(advanced.name);
    }
  });

  if (selectedSource.authentication) {
    if (selectedSource.authentication.dropdownOptions) {
      selectedSource.authentication.dropdownOptions.forEach((option: any) => {
        option.fieldsToShow.forEach((fields: any) => {
          sourceInitialValues[fields.name] =
            selectedNode?.data.nodeData[fields.name] || fields.default || "";
          if (fields.mandatory) {
            mandatoryFields.push(fields.name);
          }
        });
      });
    } else {
      selectedSource.authentication.fields.forEach((field: any) => {
        sourceInitialValues[field.name] =
          selectedNode?.data.nodeData[field.name] || field.default || "";
        if (field.mandatory) {
          mandatoryFields.push(field.name);
        }
      });
    }
  }

  sources.fields.forEach((field: any) => {
    sourceInitialValues[field.label] =
      selectedNode?.data.nodeData[field.name] ||
      selectedSource[field.label] ||
      "";
    if (field.mandatory) {
      mandatoryFields.push(field.label);
    }
  });

  const validateForm = async (values: any) => {
    return checkFormValid(values);
  };

  const checkFormValid = (values: any) => {
    let error = false;

    mandatoryFields.forEach((field) => {
      if (values[field] === "") {
        if (field === "topics") {
          if (topics[0] !== "") {
            error = false;
          } else {
            error = true;
          }
        } else if (
          authIndex !== null &&
          ((authIndex === "0" && field === "assume_role") ||
            (authIndex === "1" &&
              (field === "access_key_id" || field === "secret_access_key")))
        ) {
          error = false;
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

    const keys = Object.keys(formik.values);

    keys.forEach((item) => {
      if (formik.values[item] !== "" || item === "tls" || item === "enabled") {
        if (item === "name") {
          if (selectedNode === undefined) {
            const name = formik.values.name.replace(" ", "_");
            sourceValues.name = "input_" + name;
          }
        } else if (
          item === "log.schema" ||
          item === "log.format" ||
          item === "log"
        ) {
          let schema = formik.values.log
            ? formik.values.log.schema
            : formik.values["log.schema"];
          let format = formik.values.log
            ? formik.values.log.format
            : formik.values["log.format"];

          sourceValues.log = {
            schema: schema,
            format: format,
          };
        } else if (item === "tls" || item === "codec") {
          if (item === "tls") {
            if (
              formik.values["tls"].length !== 0 &&
              formik.values["tls"][0] === "on"
            ) {
              sourceValues["tls"] = {
                enabled: true,
              };
            } else {
              sourceValues["tls"] = { enabled: false };
            }
          } else {
            sourceValues["decoding"] = {
              codec: formik.values["codec"],
            };
          }
        } else {
          if (authIndex) {
            sourceValues["auth"] = {};

            selectedSource.authentication.dropdownOptions[
              authIndex
            ].fieldsToShow.map((field: string) => {
              if (field.name === "auth_region") {
                sourceValues.auth["region"] = formik.values[field.name];
              } else {
                sourceValues.auth[field.name] = formik.values[field.name];
              }
            });
          }

          if (formik.values.enabled && formik.values.enabled.length !== 0) {
            sourceValues["sasl"] = {};

            selectedSource.authentication.fields.map((field: string) => {
              if (field.name === "enabled") {
                sourceValues.sasl.enabled = true;
              } else {
                if (formik.values[field.name] !== "") {
                  sourceValues.sasl[field.name] = formik.values[field.name];
                }
              }
            });
          } else {
            sourceValues["sasl"] = {
              enabled: false,
            };
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
              item !== "auth_region"
            ) {
              if (formik.values[item] !== "") {
                if (item === "queue_url" && selectedSource.type === "aws_s3") {
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
              item !== "auth_region"
            ) {
              if (formik.values[item] !== "") {
                if (item === "queue_url" && selectedSource.type === "aws_s3") {
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

    if (selectedSource.mode) {
      sourceValues["mode"] = selectedSource.mode;
    }

    console.log("source values", sourceValues);

    // onSaveSettings(sourceValues);
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
        invalid = !check;
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

  const checkTabValues = () => {
    const { values } = formik;
    let tabInvalid = false;

    if (selectedTab === "setting") {
      selectedSource.settings.forEach((setting: object) => {
        Object.keys(values).forEach((value: string) => {
          if (
            !setting.options &&
            setting.name === value &&
            values[value] !== "" &&
            setting.datatype !== "integer"
          ) {
            tabInvalid = checkNonEmptyValues(values[value], setting.datatype);
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

    if (selectedTab === "advanced") {
      selectedSource.advanced.forEach((setting: object) => {
        Object.keys(values).forEach((value: string) => {
          if (
            !setting.options &&
            setting.name === value &&
            values[value] !== "" &&
            setting.datatype !== "integer"
          ) {
            tabInvalid = checkNonEmptyValues(values[value], setting.datatype);
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

    if (selectedTab === "fields") {
      selectedSource.fields.forEach((setting: object) => {
        Object.keys(values).forEach((value: string) => {
          if (
            !setting.options &&
            setting.name === value &&
            values[value] !== "" &&
            setting.datatype !== "integer"
          ) {
            tabInvalid = checkNonEmptyValues(values[value], setting.datatype);
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

  //   console.log("formik", formik.values);

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
                        <option>Select Option</option>
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
                      <option>Select Option</option>
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
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    className="mb-3"
                  >
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
                        <Form.Check // prettier-ignore
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
                          <option>Select {field.name}</option>
                          {field.options.map((value: string) => (
                            <option value={value}>{value}</option>
                          ))}
                        </Form.Select>
                      )
                    ) : (
                      <Form.Control
                        placeholder={`Enter ${field.name}`}
                        aria-label={field.label}
                        aria-describedby={field.label}
                        size="sm"
                        id={field.label}
                        onChange={formik.handleChange}
                        value={formik.values[field.name]}
                        maxLength={field.maxChar || 20}
                        type={field.datatype === "integer" ? "number" : "text"}
                        isInvalid={invalidCheck(field)}
                      />
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
                          defaultChecked={option.default}
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
                        <option>Select Option</option>
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
                    <option>Select Option</option>
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
                            <option>Select Option</option>
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
                    formik.values.enabled !== "" &&
                    formik.values.enabled.length !== 0 &&
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
                          checked={formik.values[authFields.name].length !== 0}
                        />
                      </div>
                    ) : selectedSource.authentication.name === "sasl" &&
                      (formik.values.enabled.length === 0 ||
                        formik.values.enabled === "") ? null : (
                      <Form.Select
                        aria-label="Select"
                        className="mb-3"
                        size="sm"
                        id={authFields.name}
                        onChange={formik.handleChange}
                        value={formik.values[authFields.name]}
                      >
                        <option>Select Option</option>
                        {authFields.options?.map((option: any) => (
                          <option value={option}>{option}</option>
                        ))}
                      </Form.Select>
                    )
                  ) : selectedSource.authentication.name === "sasl" &&
                    (formik.values.enabled.length === 0 ||
                      formik.values.enabled === "") ? null : (
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
          <Col xl={12} lg={12} md={12} sm={12}>
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
                    ? checkTabValues()
                    : checkFormValid(formik.values)
                }
              >
                {selectedTab === "fields" ? "Save" : "Next"}
              </Button>
            </div>
          </Col>
        </Row>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default EditSourceData;
