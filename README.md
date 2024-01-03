# Transfer Stark Cron

## Resumo do projeto

Projeto de desafio técnico para criar uma integração com  Sandbox Starkbank

Objetivos:
* Cria 10 Transferências Pix a cada 3 horas para pessoas aleatórias;
* Gera um relatório automatizado do resultado final dos testes;

## Stack utilizada

* `Node.js` v16.14.2
* `express` 4.18.2
* `node-cron` 3.0.3


## Instalação


### Instalação do projeto
* Baixe o repositório do projeto, navegue via terminal até a pasta e instale as dependências necessárias com `npm install`.

 ```
    npm install starkbank
    npm install thread-sleep
    npm install --save express node-cron fs
    npm install config
 ```
 

## Como rodar o projeto

* Antes de executar o projeto altere o agendamento do cron job para executar a cada 3 horas durante 24 horas.

Altera o código abaixo:
```
//Executa a cada 3 minutos
var task = cron.schedule("0 */3 * * * *", transferJob, {scheduled: false});
```

Para o novo código:
```
//Executa a cada 3 horas
var task = cron.schedule("0 * */3 * * *", transferJob, {scheduled: false});
```

* No terminal, acesse a pasta raiz do projeto e insira o comando `node index.js` para rodar. Em alguns segundos será exibido o log de execução
  ```
  '##### BEGIN - Executando | Current Time: '

  ```

 * O resultado final da execução será exibido no console e também será gerado no arquivo \result.txt na raiz do projeto




