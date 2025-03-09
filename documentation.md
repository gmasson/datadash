# Documentação Completa do DataDash

## Introdução
DataDash é um dashboard interativo para visualização de dados dinâmicos. Projetado para ser flexível e customizável, o DataDash permite a renderização de diversos tipos de indicadores e gráficos através de atributos HTML personalizados.

## Estrutura do Projeto
- **datadash.js**: Lógica de animação, renderização de gráficos e gerenciamento de tooltips.
- **datadash.css**: Estilos e temas (claro/escuro) para o dashboard.
- **example/index.html**: Exemplo prático de implementação e uso dos atributos `datadash-*`.

## Configuração e Atributos
Cada componente do dashboard é configurado com atributos personalizados:

- `datadash-type`: Tipo de elemento ("number", "bar", "pie", "line", "donut", "radar", "gauge").
- `datadash-title`: Título do gráfico ou indicador.
- `datadash-content`: Conteúdo para indicadores numéricos.
- `datadash-data`: Dados em formato JSON para gráficos.  
  _Exemplo para gráfico de barras:_
  ```json
  [
    {"label":"Jan", "value":65},
    {"label":"Fev", "value":59},
    {"label":"Mar", "value":80}
  ]
  ```
- `datadash-prefix` e `datadash-suffix`: Texto que antecede ou segue os números.
- `datadash-format`: Formato numérico ("int", "float", "brl", "usd", etc).
- `datadash-color`: Define a cor base para o gráfico.
- `datadash-refresh`: Intervalo (em segundos) para atualizar o componente automaticamente.

## Detalhes dos Parâmetros

- **datadash-type**: Define o tipo de exibição do componente. Valores:
  - "number": Exibe um valor numérico com animação.
  - "bar": Gráfico de barras.
  - "pie": Gráfico de pizza.
  - "line": Gráfico de linha.
  - "donut": Gráfico do tipo donut.
  - "radar": Gráfico radar.
  - "gauge": Indicador gauge.
  
- **datadash-title**: Título do componente exibido na interface.

- **datadash-content**: Para o tipo "number", representa o valor numérico inicial.

- **datadash-data**:
  - Para gráficos (bar, pie, line, donut, radar): Um array JSON com objetos contendo "label" e "value".
  - Para gauges: Um objeto JSON com "value", "min" e "max".

- **datadash-prefix**: Texto a ser exibido antes do valor.

- **datadash-suffix**: Texto a ser exibido após o valor.

- **datadash-format**: Especifica o formato numérico. Opções:
  - "int": Valor arredondado (inteiro).
  - "float": Número com 4 casas decimais.
  - "dec": Número com 2 casas decimais.
  - "brl": Formatação para moeda brasileira.
  - "usd": Formatação para dólar americano.
  - "eur": Formatação para euro.
  - "btc": Valor com 8 casas decimais seguido de "BTC".
  - "percent": Valor em porcentagem com 2 casas decimais.
  - "compact": Notação compacta.
  - "sci": Notação científica.
  - "bytes": Formatação para bytes.

- **datadash-color**: Define a cor base para o componente ou gráfico. Se não especificado, utiliza a paleta padrão de múltiplas cores.

- **datadash-refresh**: Define o intervalo em segundos para atualizar automaticamente toda a página (para casos onde precisa atualizar os dados a cada x segundos).

- **datadash-tooltip**: Texto de tooltip para elementos interativos, exibido ao passar o mouse.

## Exemplos de Uso

### Indicadores Numéricos
```html
<div class="box success" 
     datadash-type="number" 
     datadash-title="Usuários" 
     datadash-content="352">
  <!-- Conteúdo opcional exibido abaixo -->
</div>
```
_Neste exemplo, o atributo "number" ativa uma animação que incrementa de 0 até 352._

### Gráfico de Barras
```html
<div class="box warning" 
     datadash-type="bar" 
     datadash-title="Vendas por Mês" 
     datadash-data='[{"label":"Jan","value":65},{"label":"Fev","value":59},{"label":"Mar","value":80}]'
     datadash-prefix="R$ "
     datadash-format="int">
</div>
```
_A animação desenha cada barra proporcional ao valor indicado, e os valores são exibidos fora do canvas para melhor visualização._

### Gráfico de Pizza
```html
<div class="box gradient" 
     datadash-type="pie" 
     datadash-title="Distribuição de Vendas" 
     datadash-data='[{"label":"Produto A","value":30},{"label":"Produto B","value":15},{"label":"Produto C","value":55}]'
     datadash-suffix="%"
     datadash-format="int">
</div>
```
_O gráfico de pizza utiliza um gradiente para realçar as fatias e mostra os valores externos para cada segmento._

## Personalização e Temas
- **Tema Claro e Escuro**: Adicione ou remova a classe `dark` no elemento pai, com a classe `.datadash` para alternar entre os temas.
- **Cores**: As cores podem ser personalizadas via variáveis CSS definidas em `datadash.css`.

## Contribuições e Extensões
Sinta-se à vontade para contribuir com melhorias e novas funcionalidades. Consulte as diretrizes de contribuição no repositório [@gmasson/datadash](https://github.com/gmasson/datadash).
