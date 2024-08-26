import cidrRegex from "cidr-regex";

import sources from "../../data/sources.json";

const ipRegex = /^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(.(?!$)|$)){4}$/;

const alphaNumericRegex = /^[a-z0-9]+$/i;

const secretKeyRegex = /^[a-zA-Z0-9\/+]+$/;

const alphaNumberWSplRegex = /^[a-zA-Z0-9 !@#\{\}\=\$%\^\&*\\\\\/)\(+=._-]+$/;

const arnRegex = /^arn:aws:iam::\d{12}:role\/[A-Za-z0-9-]+$/;

const urlRegex =
  /^https?:\/\/?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/;

const addressRegex =
  /((?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}:\d{1,5}|(?:\d{1,3}\.){3}\d{1,3}:\d{1,5})(?:\s*,\s*(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}:\d{1,5}|\s*,\s*(?:\d{1,3}\.){3}\d{1,3}:\d{1,5})*/;

export const checkValueWithRegex = (value, type) => {
  let valid = true;

  if (type === "ipaddress") {
    console.log("value", value);
    valid = ipRegex.test(value);
    console.log("valid", valid);
  } else if (type === "ipcidr") {
    const valueSplit = value.split(",");

    valueSplit.map((value) => {
      if (!cidrRegex().test(value)) {
        valid = false;
      }
    });
  } else if (type === "alphanumeric") {
    valid = alphaNumericRegex.test(value);
  } else if (type === "arn") {
    valid = arnRegex.test(value);
  } else if (type === "url") {
    valid = urlRegex.test(value);
  } else if (type === "cs-hostport") {
    valid = addressRegex.test(value);
  } else if (type === "alphanumericSpecial") {
    valid = secretKeyRegex.test(value);
  } else if (type === "password" || type === "text-special") {
    valid = alphaNumberWSplRegex.test(value);
  }

  return valid;
};

export const checkAccessAuthFields = (field) => {
  return field === "assume_role";
};

export const checkAssumeAuthFieldsOne = (field) => {
  return field === "access_key_id";
};
export const checkAssumeAuthFieldsTwo = (field) => {
  return field === "secret_access_key";
};

export const getSourceFromID = (uuid, type, currentSource) => {
  let mainSource = {};
  let sourceJson = sources.sources;

  if (type === "destination") {
    sourceJson = sources.destinations;
  }

  sourceJson.forEach((source) => {
    if (source.uuid === uuid) {
      mainSource = source;
    }
  });

  if (!mainSource.name) {
    sourceJson.forEach((source) => {
      if (source.type === currentSource.type) {
        mainSource = source;
      }
    });
  }

  return mainSource;
};

export const getVersionId = (versionid) => {
  let versionId = versionid.substring(0, 8);

  return versionId;
};
