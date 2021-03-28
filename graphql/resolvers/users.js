const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/User');
const {SECRET_KEY} = require('../../config');
const { UserInputError } = require('apollo-server');
const { validateRegisterInput , validateLoginInput} = require('../../utils/validator');

const generateToken = (res) => {
   return  jwt.sign({
        id : res.id,
        email: res.email,
        username: res.username
    },
    SECRET_KEY,
    {expiresIn : '1h'}
    )

}

module.exports = {
    Mutation: {
        async login(_,{username, password, email}) {

            const { errors, valid } = validateLoginInput(username, password, email);

            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            let userData;
            if(username){
                userData = await User.findOne({username}).exec();
            }

            if(email){
                userData = await User.findOne({email}).exec();
            }

            if(!userData){
                errors.general = 'user not found';
                throw new UserInputError('user not found',{
                    errors
                });
            }
            const matchPassword = await bcrypt.compareSync(password, userData.password);

            if(!matchPassword){
                errors.general = 'Wrong Credentials';
                throw new UserInputError('Wrong Credentials',{
                    errors
                });
            }
            const token = generateToken(userData);

            return {
                ...userData._doc,
                id : userData._id,
                token
            }

        },
       async register(
        _, 
        { 
            registerInput: { username, email, password, confirmPassword}
        },
        context, info
        ){
            // Validate user data
            const { errors , valid } = validateRegisterInput( 
                                        username,
                                        email, 
                                        password, 
                                        confirmPassword
                                        );

            if(!valid){
                throw new UserInputError('Errors',{ errors })
            }

            // Make sure user doesn't exist 
            const user = await User.findOne({username}).exec();
            // Make sure user doesn't exist 
            const userExists = await User.findOne({email}).exec();
            if(user){
                throw new UserInputError('username is taken',{
                    errors:{
                        username: 'This username is taken',
                    }
                });
            }

            if(userExists){
                throw new UserInputError('email is taken',{
                    errors:{
                        username: 'This email is taken',
                    }
                });

            }


            // hash password and create an auth token
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString(),
            });
            const  res = await newUser.save();
            
            const token = generateToken(res);

            return {
                ...res._doc,
                id : res._id,
                token
            }
        }
    }
}