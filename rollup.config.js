// 默认可以导出一个对象，作为打包的配置文件
import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve'
export default {
    input:'./src/index.js',
    output: {
        file:'./dist/vue.js',
        // new Vue
        name:'Vue',
        // 打包格式
        format:'umd',
        sourcemap:true
    },
    plugins:[
        babel({
            exclude: 'node_modules/**'
        }),
        resolve()
    ]
}