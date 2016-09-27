let fs = require('fs')
let str = fs.readFileSync('./response.txt')
let m;
let projects = [];

let regexs = {
	projectId: /projectId:(\d*),/g,
	start: /projectStartSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
	end: /projectEndSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
	title: /projectNme:"([\s\S]*?)",projectStartSdt:/g,
	desc: /projectDesc:"([\s\S]*?)",projectEndSdt/g ,
}

while ((m = regexs.projectId.exec(str)) !== null) {
  if (m.index === regexs.projectId.lastIndex) {
      regexs.projectId.lastIndex++;
  }
  console.log(m);
  let id = m;
  let title = regexs.title.exec(str);
  let desc 	= regexs.desc.exec(str);
  let start = regexs.start.exec(str);
  let end 	= regexs.end.exec(str);

		projects.push({	title: title[1],
										id: 	 id[1],
										desc:  desc[1],
										end: `${end[2]}/${end[3]}/${end[1]}`,
										start: `${start[2]}/${start[3]}/${start[1]}`
		});
}

console.log(projects)
debugger;