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
import { checkValueWithRegex } from "./helper";

import toast, { toastConfig } from "react-simple-toasts";
import "react-simple-toasts/dist/theme/dark.css";

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

    let nameAvailable = true;

    if (addedNodes.length !== 0) {
      const name = formik.values["name"];

      addedNodes.forEach((node) => {
        if (selectedNode === undefined) {
          const enteredName = name.replaceAll(" ", "_");
          const inputName = "output_" + enteredName;

          if (node.data.nodeData.name === inputName) {
            nameAvailable = false;
          }
        }
      });
    }

    if (!nameAvailable) {
      toast(
        "Destination name is already used in configuration, please enter a different name.",
        {
          position: "top-right",
          zIndex: 9999,
        }
      );
    } else {
      const keys = Object.keys(formik.values);

      keys.forEach((item) => {
        if (formik.values[item] !== "") {
          if (item === "name") {
            if (selectedNode === undefined) {
              const name = formik.values.name.replaceAll(" ", "_");
              sourceValues.name = "output_" + name;
            }
          } else if (item === "codec") {
            sourceValues["encoding"] = {
              codec: formik.values["codec"],
            };
          } else if (item === "inputs") {
            sourceValues[item] = [];
          } else if (item === "compression") {
            if (Array.isArray(formik.values["compression"])) {
              if (formik.values["compression"][0] === "on") {
                sourceValues["compression"] = true;
              } else {
                sourceValues["compression"] = false;
              }
            } else {
              sourceValues["compression"] = formik.values["compression"];
            }
          } else {
            if (authIndex) {
              sourceValues["auth"] = {};

              selectedDestination.authentication.dropdownOptions[
                authIndex
              ].fieldsToShow.map((field: string) => {
                if (field.name === "auth_region") {
                  sourceValues.auth["region"] = formik.values[field.name];
                } else {
                  sourceValues.auth[field.name] = formik.values[field.name];
                }
              });
            }

            if (sourceValues.auth && sourceValues.auth[item] === undefined) {
              sourceValues[item] = formik.values[item];
            } else {
              if (
                item !== "assume_role" &&
                item !== "access_key_id" &&
                item !== "secret_access_key" &&
                item !== "auth_region"
              ) {
                sourceValues[item] = formik.values[item];
              }
            }
          }
        }
      });

      sourceValues["type"] = selectedDestination.type;

      console.log("source values", sourceValues);

      onSaveSettings(sourceValues);
    }
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
                            Select {setting.name}
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
                                        placement="left"
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
            ) : selectedDestination.authentication &&
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
                      Select Auth
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
                      <option value="" hidden>
                        Select {setting.name}
                      </option>
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
                  selectedTab === "setting" ||
                  (selectedTab === "auth" && selectedDestination.advanced)
                    ? checkTabValues("")
                    : checkFormValid(formik.values) || checkTabValues("all")
                }
              >
                {selectedTab === "setting" ||
                (selectedTab === "auth" && selectedDestination.advanced)
                  ? "Next"
                  : "Save"}
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
