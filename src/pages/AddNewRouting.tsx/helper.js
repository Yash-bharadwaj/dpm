import cidrRegex from "cidr-regex";

const ipRegex = /^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(.(?!$)|$)){4}$/;

const alphaNumericRegex = /^[a-z0-9]+$/i;

const secretKeyRegex = /^[a-zA-Z0-9\/]+$/;

const alphaNumberWSplRegex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]+$/;

const arnRegex = /^arn:aws:iam::\d{12}:role\/[A-Za-z0-9-]+$/;

const urlRegex =
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

const addressRegex =
  /^\s*(?:(?:\d(?:[0-9]{1,5})*\.)+\d+)(?:(?:\d+(?:\d+)*\.)+\d+)\:[0-9]{1,5}\s*(?:,\s*(?:(?:\d+(?:\d+)*\.)+\d+)(?:(?:\d+(?:\d+)*\.)+\d+)\:[0-9]{1,5}\s*)*$/;

export const checkValueWithRegex = (value, type) => {
  let valid = true;

  if (type === "ipaddress") {
    valid = ipRegex.test(value);
  } else if (type === "ipcidr") {
    valid = cidrRegex().test(value);
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
  } else if (type === "password") {
    valid = alphaNumberWSplRegex.test(value);
  }

  return valid;
};
