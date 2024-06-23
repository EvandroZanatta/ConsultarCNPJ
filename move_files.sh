#!/bin/bash

cd downloads

organize() {
    echo -e "\n\n########"
    echo -e "Create struture for $1"
    echo -e "########"

    rm -Rf $1
    mkdir $1
    
    echo -e "\n>>> Copy files\n"
    cp $2* $1/
    cd $1
    
    echo -e "\n>>> Unzip files\n"
    unzip "*.zip"

    echo -e "\n>>> Cleanning .zip\n"
    rm *.zip
    cd ..
    
    echo -e "\n>>> Finish"
    echo "########"
}

organize cnaes Cnaes
organize empresas Empresas
organize estabelecimentos Estabelecimentos
organize motivos Motivos
organize municipios Municipios
organize naturezas Naturezas
organize paises Paises
organize qualificacoes Qualificacoes
organize simples Simples
organize socios Socios