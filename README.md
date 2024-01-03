# Transfer Stark Cron

## Resumo do projeto

Projeto de desafio técnico para criar uma integração com  Sandbox Starkbank

Objetivos:
* Cria 10 Transferências Pix a cada 3 horas para pessoas aleatórias;
* Gera um relatório automatizado do resultado final dos testes;

## Stack utilizada

* `Node.js` v16.14.2
* `express` 4.18.2,


## Instalação


### Instalação do projeto
* Baixe o repositório do projeto, navegue via terminal até a pasta e instale as dependências necessárias com `npm install`.

 ```
    npm install starkbank
    npm install thread-sleep
    npm install --save express node-cron fs
    
 ```

## Como rodar o projeto

* No terminal, acesse a pasta raiz do projeto e insira o comando `node index.js` para rodar. Em alguns segundos será exibido o log de execução
  ```
  '##### BEGIN - Executando | Current Time: '

  ```

 * O resultado final da execução será exibido no console e também será gerado no arquivo \result.txt na raiz do projeto




