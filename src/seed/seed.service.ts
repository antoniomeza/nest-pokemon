import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import * as request from 'supertest';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios
  
  constructor(

    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>

  ) {}

  async executeSeed() {

    // Limpiar Tabla
    await this.pokemonModel.deleteMany({})
    
    // Obtener Datos del API
    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650')

    // // Guardar Array
    // const insertPromisesArray = []
    // data.results.forEach(({ name, url }) => {
    //   const segments = url.split('/')
    //   const no: number = + segments[ segments.length - 2 ]
    //   console.log({ name, no })
    //   //const pokemon = await this.pokemonModel.create( { name, no } )
    //   insertPromisesArray.push(
    //     this.pokemonModel.create({ name, no })
    //   )
    // })

    // await Promise.all( insertPromisesArray )

    // Guardar un solo Insert
    const pokemonToInsert: { name: string, no: number }[] = []
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/')
      const no: number = + segments[ segments.length - 2 ]
      pokemonToInsert.push({ name, no })
    })
    
    await this.pokemonModel.insertMany( pokemonToInsert )
    return "Seed Executed"

  }

}
