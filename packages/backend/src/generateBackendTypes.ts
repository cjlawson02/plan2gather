/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'toml';
import { resolve } from 'path';

// From https://stackoverflow.com/questions/5612787/converting-an-object-to-a-string
function objToString(obj: unknown, ndeep = 1): string {
  if (obj == null) {
    return String(obj);
  }
  switch (typeof obj) {
    case 'string':
      return `"${obj}"`;
    case 'function':
      return obj.name || obj.toString();
    case 'object': {
      const indent = Array(ndeep * 4 + 1).join(' ');
      const isArray = Array.isArray(obj);
      const openBrace = '{['[Number(isArray)];
      const closeBrace = '}]'[Number(isArray)];
      return `${
        openBrace +
        Object.keys(obj)
          .map(
            (key) => `\n${indent}${key}: ${objToString(obj[key], ndeep + 1)},`
          )
          .join('')
      }\n${indent.slice(0, -4)}${closeBrace}`;
    }
    default:
      return obj.toString();
  }
}

const workerToml = readFileSync(
  resolve(__dirname, '../wrangler.toml'),
  'utf-8'
);
const parsedToml = parse(workerToml);

const nameSpaceDefinitions = Object.entries(parsedToml.env)
  .map(([envKey, envData]: [string, any]) =>
    envData.kv_namespaces.reduce((acc: any, curr: any) => {
      acc[curr.binding] = { [envKey]: curr.id };
      return acc;
    }, {})
  )
  .reduce((acc, envSet) => {
    Object.keys(envSet).forEach((key) => {
      if (acc[key]) {
        acc[key] = { ...acc[key], ...envSet[key] };
      } else {
        acc[key] = envSet[key];
      }
    });
    return acc;
  }, {});

const tomlTypeOutput = `// Please do not modify this file it is generated by \`generateBackendTypes.ts\`
/* eslint-disable */

export interface APIEnv {
    url: string;
}
${Object.entries(parsedToml.env)
  .map(
    ([envKey, envData]: [string, any]) =>
      `export const ${envKey.toUpperCase()}_ENV: APIEnv = {
    url: "https://${envData.route.slice(0, -2)}",
};`
  )
  .join('\n')}
export const LOCAL_ENV: APIEnv = {
    url: "http://${parsedToml.dev.ip}:${parsedToml.dev.port}",
};

export const cloudflareNamespaceInformation = ${objToString(
  nameSpaceDefinitions
)} as const;

export const cloudflareAccountId = "${parsedToml.account_id}";
`;

writeFileSync(
  resolve(__dirname, './generated/tomlGenerated.ts'),
  tomlTypeOutput
);
