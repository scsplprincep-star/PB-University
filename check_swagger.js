import fs from 'fs';
let raw = fs.readFileSync('swagger.json', 'utf8');
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const swagger = JSON.parse(raw);

let endpointInfo = swagger.paths['/api/new_student_details_contoller/new_student_details_insert'];
if(!endpointInfo) {
  const paths = Object.keys(swagger.paths);
  const matched = paths.find(p => p.toLowerCase() === '/api/new_student_details_contoller/new_student_details_insert'.toLowerCase());
  if(matched) endpointInfo = swagger.paths[matched];
}

console.log(JSON.stringify(endpointInfo.post.requestBody.content['multipart/form-data'].schema, null, 2));
