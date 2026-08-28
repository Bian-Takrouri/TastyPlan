import {Entity,PrimaryGeneratedColumn,Column} from "typeorm";

@Entity("origins")
export class Origin {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "varchar",
        length: 100,
        unique: true
    })
    name!: string;

    @Column({
        type: "varchar",
        length: 100,
        nullable: true
    })
    country!: string | null;

    @Column({
        name: "flag_url",
        type: "varchar",
        length: 500,
        nullable: true
    })
    flagUrl!: string | null;
}