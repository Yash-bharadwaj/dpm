import cidrRegex from "cidr-regex";

const ipRegex = /^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(.(?!$)|$)){4}$/;

const alphaNumericRegex = /^[a-z0-9]+$/i;

const secretKeyRegex = /^[a-zA-Z0-9\/+]+$/;

const alphaNumberWSplRegex = /^[a-zA-Z0-9 !@#\{\}\=\$%\^\&*\\\\\/)\(+=._-]+$/;

const arnRegex = /^arn:aws:iam::\d{12}:role\/[A-Za-z0-9-]+$/;

const urlRegex =
  /^https?:\/\/[a-z0-9]+(?:[-.][a-z0-9]+)*(?::[0-9]{1,5})?(?:\/[^\/\r\n]+)*\.[a-z]{2,5}(?:[?#]\S*)?$/;

const addressRegex =
  /^\s*(?:(?:\w(?:\w)*\.)+\w+)(?:(?:\w+(?:\w+)*\.)+\w+)\:[0-9]{1,5}\s*(?:,\s*(?:(?:\w+(?:\w+)*\.)+\w+)(?:(?:\w+(?:\w+)*\.)+\w+)\:[0-9]{1,5}\s*)*$/;

export const checkValueWithRegex = (value, type) => {
  let valid = true;

  if (type === "ipaddress") {
    valid = ipRegex.test(value);
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
