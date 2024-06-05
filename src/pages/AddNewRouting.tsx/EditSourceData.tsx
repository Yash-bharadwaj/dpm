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

const EditSourceData = ({
  show,
  onClose,
  selectedSource,
  onSaveSettings,
  selectedNode,
}: any) => {
  const [selectedTab, setSelectedTab] = useState("setting");
  const [authIndex, setAuthIndex] = useState(null);

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
        if (
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
      if (formik.values[item] !== "") {
        if (item === "name") {
          if (selectedNode === undefined) {
            sourceValues.name = "input_" + formik.values.name;
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
        } else {
          if (authIndex) {
            sourceValues["auth"] = {};

            selectedSource.authentication.dropdownOptions[
              authIndex
            ].fieldsToShow.map(
              (field: string) =>
                (sourceValues.auth[field.name] = formik.values[field.name])
            );
          }
          if (formik.values.enabled) {
            sourceValues["sasl"] = {};

            selectedSource.authentication.fields.map(
              (field: string) =>
                (sourceValues.sasl[field.name] = formik.values[field.name])
            );
          }

          if (
            (sourceValues.auth && sourceValues.auth[item] === undefined) ||
            (sourceValues.sasl && sourceValues.sasl[item] === undefined)
          ) {
            sourceValues[item] = formik.values[item];
          } else {
            sourceValues[item] = formik.values[item];
          }
        }
      }
    });

    sourceValues["type"] = selectedSource.type;
    sourceValues["disabled"] = false;

    onSaveSettings(sourceValues);
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
                      <Form.Check // prettier-ignore
                        type="switch"
                        id={setting.name}
                        label={
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
                        }
                        value={formik.values[setting.name]}
                        defaultChecked={setting.default}
                        onChange={formik.handleChange}
                      />
                    ) : (
                      <Form.Select
                        aria-label="Select"
                        className="mb-3"
                        size="sm"
                        onChange={formik.handleChange}
                        id={setting.name}
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
                    >
                      <option>Select Option</option>
                      {regions?.regions?.map((option: any) => (
                        <option value={option.value}>{option.name}</option>
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
                        htmlFor="inputID"
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
                              <Tooltip id="button-tooltip-2">
                                {field.tooltip}
                              </Tooltip>
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
                              htmlFor="inputID"
                              style={{ marginRight: "8px" }}
                            >
                              {field.label}
                              {field.tooltip && (
                                <OverlayTrigger
                                  placement="right"
                                  overlay={
                                    <Tooltip id="button-tooltip-2">
                                      {field.tooltip}
                                    </Tooltip>
                                  }
                                >
                                  <QuestionCircle size={14} />
                                </OverlayTrigger>
                              )}
                            </Form.Label>
                          }
                          value={formik.values[field.name]}
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
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : selectedTab === "advanced" ? (
              selectedSource.advanced?.map((setting: any) => (
                <>
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

                  <Form.Control
                    placeholder={`Enter ${setting.label}`}
                    aria-label={setting.name}
                    aria-describedby={setting.name}
                    className="mb-3"
                    size="sm"
                    id={setting.name}
                    onChange={formik.handleChange}
                    value={formik.values[setting.name]}
                  />
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
                        <Tooltip id="button-tooltip-2">
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
                          <Tooltip id="button-tooltip-2">
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
                                <Tooltip id="button-tooltip-2">
                                  {setting.tooltip}
                                </Tooltip>
                              }
                            >
                              <QuestionCircle size={14} />
                            </OverlayTrigger>
                          )}
                        </Form.Label>

                        <Form.Control
                          placeholder={`Enter ${setting.placeholder}`}
                          aria-label={setting.name}
                          aria-describedby={setting.name}
                          className="mb-3"
                          size="sm"
                          id={setting.name}
                          onChange={formik.handleChange}
                          value={formik.values[setting.name]}
                        />
                      </>
                    ))}
                  </>
                )}
              </Form>
            ) : (
              selectedSource.authentication?.fields.map((setting: any) => (
                <>
                  {((selectedSource.authentication.name !== "sasl" &&
                    setting.datatype !== "boolean") ||
                    (selectedSource.authentication.name === "sasl" &&
                      formik.values.enabled !== "" &&
                      formik.values.enabled !== false &&
                      setting.datatype !== "boolean")) && (
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
                      <Form.Check // prettier-ignore
                        type="switch"
                        id={setting.name}
                        label={
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
                        }
                        value={formik.values[setting.name]}
                        defaultChecked={setting.default}
                        onChange={formik.handleChange}
                      />
                    ) : selectedSource.authentication.name === "sasl" &&
                      (formik.values.enabled === false ||
                        formik.values.enabled === "") ? null : (
                      <Form.Select
                        aria-label="Select"
                        className="mb-3"
                        size="sm"
                        id={setting.name}
                        onChange={formik.handleChange}
                      >
                        <option>Select Option</option>
                        {setting.options?.map((option: any) => (
                          <option value={option}>{option}</option>
                        ))}
                      </Form.Select>
                    )
                  ) : selectedSource.authentication.name === "sasl" &&
                    (formik.values.enabled === false ||
                      formik.values.enabled === "") ? null : (
                    <Form.Control
                      placeholder={`Enter ${setting.placeholder}`}
                      aria-label={setting.name}
                      aria-describedby={setting.name}
                      className="mb-3"
                      size="sm"
                      id={setting.name}
                      onChange={formik.handleChange}
                      value={formik.values[setting.label]}
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
                disabled={checkFormValid(formik.values)}
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
