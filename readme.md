

### typescript setup video https://youtu.be/-ifcPnXHn8Q?si=bMkhH7R2i2tX6PBp
### tyepscrept run 

npm init -y
npm i express
npm i --save-dev typescript @types/express @types/node
npx tsc --init
npx tsc
node build/app.js


#  typescript install and run :
npm init

npm install --save-dev typescript ts-node-dev

## tsconfig.json
{
  "compilerOptions": {
    "target": "es2015",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    // "skipLibCheck": true,
    // "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
    // "rootDir": "./src"
  }
}


npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

## create file .eslintrc.js

module.exports = {
  env: {
    es2016: true,
    node: true,
  },
  extends: [`eslint:recommended`, `plugin:@typescript-eslint/recommended`],
  parser: `@typescript-eslint/parser`,
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: `module`,
  },
  plugins: [`@typescript-eslint`],
};

## create .gitignore  add lines
      /node_ modules
      /build
   <!-- #  System-files -->
      .DS_Store
      Thumbs.db




npm install express
npm install --save-sev @types/express

## package.json add lines
 "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only --files src/index.ts",
    "build": "tsc"
  },


npm run build
npm run dev


### mongodb staus check and start
systemctl status mongod
systemctl start mongod

password: yoursystempassword
.






