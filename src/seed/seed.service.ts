import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {

  constructor(

    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,
    
    private readonly http: AxiosAdapter

  ) {}

  async executeSeed() {

    // Limpiar Tabla
    await this.pokemonModel.deleteMany({})
    
    // Obtener Datos del API
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=20')

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
