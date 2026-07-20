class Calculadora {
    sumar(params) {
        const { a, b } = params;
        const resultado = Number(a) + Number(b);
        console.log(`[EJECUCIÓN CORE]: Se ejecutó Calculadora.sumar con éxito. Resultado: ${resultado}`);
        return { resultado };
    }

    restar(params) {
        const { a, b } = params;
        const resultado = Number(a) - Number(b);
        console.log(`[EJECUCIÓN CORE]: Se ejecutó Calculadora.restar con éxito. Resultado: ${resultado}`);
        return { resultado };
    }
}
export default Calculadora;