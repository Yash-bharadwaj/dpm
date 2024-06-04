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

import { useState } from "react";
import { useFormik } from "formik";

const EditDestinationData = ({
  show,
  onHide,
  selectedDestination,
  onSaveSettings,
  addedSources,
  selectedNode,
}: any) => {
  const [selectedTab, setSelectedTab] = useState("setting");
  const [authIndex, setAuthIndex] = useState(null);

  let destInitialValues = {};
  let mandatoryFields = [];

  selectedDestination.settings.forEach((setting: any) => {
    if (setting.name === "inputs") {
      destInitialValues[setting.name] =
        selectedNode?.data.nodeData[setting.name] || setting.default || [];
    } else {
      destInitialValues[setting.name] =
        selectedNode?.data.nodeData[setting.name] || setting.default || "";
    }
    if (setting.mandatory) {
      mandatoryFields.push(setting.name);
    }
  });

  selectedDestination.advanced?.forEach((advanced: any) => {
    destInitialValues[advanced.name] =
      selectedNode?.data.nodeData[advanced.name] || advanced.default || "";
    if (advanced.mandatory) {
      mandatoryFields.push(advanced.name);
    }
  });

  if (selectedDestination.authentication) {
    if (selectedDestination.authentication.dropdownOptions) {
      selectedDestination.authentication.dropdownOptions.forEach(
        (option: any) => {
          option.fieldsToShow.forEach((fields: any) => {
            destInitialValues[fields.name] =
              selectedNode?.data.nodeData[fields.name] || fields.default || "";
            if (fields.mandatory) {
              mandatoryFields.push(fields.name);
            }
          });
        }
      );
    } else {
      selectedDestination.authentication.fields.forEach((field: any) => {
        destInitialValues[field.name] =
          selectedNode?.data.nodeData[field.name] || field.default || "";
        if (field.mandatory) {
          mandatoryFields.push(field.name);
        }
      });
    }
  }

  const validateForm = async (values: any) => {
    return checkFormValid(values);
  };

  const checkFormValid = (values: any) => {
    let error = false;

    mandatoryFields.forEach((field) => {
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
  };

  const onNextClick = () => {
    if (selectedTab === "setting") {
      if (selectedDestination.authentication) {
        setSelectedTab("auth");
      } else if (selectedDestination.advanced) {
        setSelectedTab("advanced");
      } else {
        setSelectedTab("fields");
      }
    }

    if (selectedTab === "advanced") {
      saveSettings();
    }

    if (selectedTab === "auth") {
      if (selectedDestination.advanced) {
        setSelectedTab("advanced");
      } else {
        saveSettings();
      }
    }
  };

  const saveSettings = () => {
    const sourceValues = {};

    const keys = Object.keys(formik.values);

    keys.forEach((item) => {
      if (formik.values[item] !== "") {
        if (item === "name") {
          if (selectedNode === undefined) {
            sourceValues.name = "output_" + formik.values.name;
          }
        } else if (item === "inputs") {
          sourceValues[item] = [];
        } else {
          if (authIndex) {
            sourceValues["auth"] = {};

            selectedDestination.authentication.dropdownOptions[
              authIndex
            ].fieldsToShow.map(
              (field) =>
                (sourceValues.auth[field.name] = formik.values[field.name])
            );
          } else {
            sourceValues[item] = formik.values[item];
          }
        }
      }
    });

    sourceValues["type"] = selectedDestination.type;
    sourceValues["disabled"] = false;

    onSaveSettings(sourceValues);
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

            {/* <div
              className={`settings-menu pointer ${
                selectedTab === "fields" && `settings-selected-menu`
              }`}
              onClick={() => {
                onTabSelect("fields");
              }}
            >
              Fields
            </div> */}
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
                        <Form.Check // prettier-ignore
                          type="switch"
                          id="custom-switch"
                          label={
                            <Form.Label
                              htmlFor="inputID"
                              style={{ marginRight: "8px" }}
                            >
                              {setting.label}
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
                        placeholder={`Enter ${setting.label}`}
                        aria-label={setting.name}
                        aria-describedby={setting.name}
                        className="mb-3"
                        size="sm"
                        id={setting.name}
                        onChange={formik.handleChange}
                        value={formik.values[setting.name]}
                      />
                    ))}
                </>
              ))
            ) : selectedTab === "advanced" ? (
              selectedDestination.advanced?.map((setting: any) => (
                <>
                  {setting.datatype !== "boolean" && (
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

                  {setting.options ? (
                    setting.datatype === "boolean" ? (
                      <Form.Check // prettier-ignore
                        type="switch"
                        id={setting.name}
                        label={
                          <Form.Label
                            htmlFor="inputID"
                            style={{ marginRight: "8px" }}
                          >
                            {setting.label}
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
                        id={setting.name}
                        onChange={formik.handleChange}
                        value={formik.values[setting.name]}
                      >
                        <option>Select Option</option>
                        {setting.options?.map((option: any) => (
                          <option value={option.name || option}>
                            {option.label || option}
                          </option>
                        ))}
                      </Form.Select>
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
                    />
                  )}
                </>
              ))
            ) : selectedDestination.authentication &&
              selectedDestination.authentication.dropdownOptions ? (
              <Form>
                <Form.Label htmlFor={"auth"}>
                  Select Authentication{" "}
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
                    <option>Select Option</option>
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
              selectedDestination.authentication?.fields.map((setting: any) => (
                <>
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

                  {setting.options ? (
                    <Form.Select
                      aria-label="Select"
                      className="mb-3"
                      size="sm"
                      id={setting.name}
                      onChange={formik.handleChange}
                      value={formik.values[setting.name]}
                    >
                      <option>Select Option</option>
                      {setting.options?.map((option: any) => (
                        <option value={option}>{option}</option>
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

export default EditDestinationData;
