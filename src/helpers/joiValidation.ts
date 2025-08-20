import Joi from "joi";

// Define the expected input type (optional, for better type safety)
interface RegisterInput {
  name: string;
  email?: string;
  gender?: string;
  mobileNumber: string;
  password: string;
  address?: string;
  parentInfo?: object;
  role?: string;
  status?: string;
  countryCode?: string;
}

// validating register schema
const registerSchema = async (val: RegisterInput) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email(),
    gender: Joi.string(),
    mobileNumber: Joi.string()
      .required()
      .length(10)
      .pattern(/^[0-9]+$/),
    password: Joi.string().required(),
    address: Joi.string(),
    parentInfo: Joi.object(),
    role: Joi.string(),
    status: Joi.string(),
    countryCode: Joi.string(),
  });

  const result = await schema.validateAsync(val, { abortEarly: false });
  return result;
};

export { registerSchema };
