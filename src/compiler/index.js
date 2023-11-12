const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
// const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

// 对模板进行编译
function parseHTML(html) { // html最开始一定是<
    // 最终需要转化成一颗抽象语法树
    function start(tag,attrs) {
        console.log(tag,attrs,"开始");
    }
    function chars(text) {
        console.log(text,'文本');
    }
    function end(tag) {
        console.log(tag,'结束');
    }
    function advance(n) {
        html = html.substring(n)
    }
    function parseStartTag() {
        const start = html.match(startTagOpen);
        if(start) {
            const match = {
                tagName:start[1],
                attrs:[]
            }
            advance(start[0].length);
            // console.log(match,html);
            let attr,end;
            while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length)
                match.attrs.push({name:attr[1],value:attr[3] || attr[4] || attr[5] || true})
            }
            // 存在>时，要把>删掉
            if(end) {
                advance(end[0].length)
            }
            return match
        }
        // 如果不是开始标签的结束就一直匹配

        return false
    }
    while(html) {
        // 如果textEnd为0，说明是一个开始标签
        // 如果textEnd>0,说明是文本的介绍位置
        let textEnd = html.indexOf('<');
        if(textEnd === 0) {
            const startTagMatch = parseStartTag()
            if(startTagMatch) { // 解析到开始标签
                start(startTagMatch.tagName,startTagMatch.attrs)
                continue
            }
            let endTagMatch = html.match(endTag)
            if(endTagMatch) {
                advance(endTagMatch[0].length)
                end(endTagMatch[1])
                continue;
            }
        }
        // 截取文本的内容
        if(textEnd > 0) {
            let text = html.substring(0,textEnd)
            if(text) {
                chars(text)
                advance(text.length)
            }
        }
    }
    console.log(html);
}
export function compileToFunction(template) {
    // 1、将template转为ast语法书
    // debugger
    let ast =  (template)
    // 2、生产render方法（render方法返回的就是虚拟DOM）
    
}